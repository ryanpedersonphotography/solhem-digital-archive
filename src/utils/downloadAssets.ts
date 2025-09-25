import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Layout, MediaAsset } from '../types';

export async function downloadLayoutAssets(layout: Layout) {
  const zip = new JSZip();
  const layoutFolder = zip.folder(layout.name.replace(/\s+/g, '_'));
  
  if (!layoutFolder) {
    throw new Error('Failed to create zip folder');
  }

  // Create a metadata JSON file
  const metadata = {
    name: layout.name,
    type: layout.type,
    bedrooms: layout.bedrooms,
    bathrooms: layout.bathrooms,
    squareFeet: layout.squareFeet,
    baseRent: layout.baseRent,
    description: layout.description,
    features: layout.features,
    availableUnits: layout.availableUnits,
    virtual3DTour: layout.virtual3DTour || null,
    downloadedAt: new Date().toISOString()
  };
  
  layoutFolder.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Track promises for parallel downloads
  const downloadPromises: Promise<void>[] = [];

  // Download floor plan if available
  if (layout.floorPlan) {
    downloadPromises.push(
      fetchAndAddToZip(
        layoutFolder, 
        layout.floorPlan, 
        `floor_plan_${layout.floorPlan.id}`
      )
    );
  }

  // Download all marketing images
  layout.marketingImages.forEach((image, index) => {
    downloadPromises.push(
      fetchAndAddToZip(
        layoutFolder,
        image,
        `marketing_${index + 1}_${image.id}`
      )
    );
  });

  // Wait for all downloads to complete
  try {
    await Promise.all(downloadPromises);
  } catch (error) {
    console.error('Error downloading some assets:', error);
    // Continue with partial download
  }

  // Generate the zip file
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Save the file
  const fileName = `${layout.name.replace(/\s+/g, '_')}_assets_${Date.now()}.zip`;
  saveAs(content, fileName);
}

async function fetchAndAddToZip(
  folder: JSZip | null, 
  asset: MediaAsset, 
  baseName: string
): Promise<void> {
  if (!folder) return;
  
  try {
    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${asset.url}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const extension = getFileExtension(asset.url, blob.type);
    const fileName = `${baseName}${extension}`;
    
    folder.file(fileName, blob);
    
    // Add metadata for this image
    const imageMetadata = {
      id: asset.id,
      title: asset.title,
      description: asset.description || '',
      tags: asset.tags,
      originalUrl: asset.url,
      thumbnailUrl: asset.thumbnailUrl || '',
      type: asset.type,
      uploadedAt: asset.uploadedAt,
      size: asset.size,
      dimensions: asset.dimensions || null
    };
    
    folder.file(`${baseName}_metadata.json`, JSON.stringify(imageMetadata, null, 2));
  } catch (error) {
    console.error(`Failed to download asset ${asset.id}:`, error);
    // Add error notice to zip
    folder.file(`${baseName}_ERROR.txt`, `Failed to download: ${error}`);
  }
}

function getFileExtension(url: string, mimeType: string): string {
  // Try to get extension from URL
  const urlMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i);
  if (urlMatch) {
    return '.' + urlMatch[1].toLowerCase();
  }
  
  // Fallback to mime type
  const mimeExtensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp'
  };
  
  return mimeExtensions[mimeType] || '.jpg';
}

// Additional utility for downloading all layouts of a property
export async function downloadAllPropertyLayouts(
  layouts: Layout[], 
  propertyName: string
): Promise<void> {
  const zip = new JSZip();
  const propertyFolder = zip.folder(propertyName.replace(/\s+/g, '_'));
  
  if (!propertyFolder) {
    throw new Error('Failed to create property folder');
  }

  // Create property overview
  const overview = {
    propertyName,
    totalLayouts: layouts.length,
    layouts: layouts.map(l => ({
      name: l.name,
      type: l.type,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      squareFeet: l.squareFeet,
      baseRent: l.baseRent,
      availableUnits: l.availableUnits
    })),
    downloadedAt: new Date().toISOString()
  };
  
  propertyFolder.file('property_overview.json', JSON.stringify(overview, null, 2));

  // Download each layout's assets
  for (const layout of layouts) {
    const layoutFolder = propertyFolder.folder(layout.name.replace(/\s+/g, '_'));
    if (!layoutFolder) continue;

    const downloadPromises: Promise<void>[] = [];

    // Add layout metadata
    layoutFolder.file('layout_info.json', JSON.stringify({
      ...layout,
      marketingImages: layout.marketingImages.length,
      hasFloorPlan: !!layout.floorPlan,
      has3DTour: !!layout.virtual3DTour
    }, null, 2));

    // Download floor plan
    if (layout.floorPlan) {
      downloadPromises.push(
        fetchAndAddToZip(layoutFolder, layout.floorPlan, 'floor_plan')
      );
    }

    // Download marketing images
    layout.marketingImages.forEach((image, index) => {
      downloadPromises.push(
        fetchAndAddToZip(layoutFolder, image, `marketing_${index + 1}`)
      );
    });

    await Promise.all(downloadPromises);
  }

  // Generate and save the zip
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const fileName = `${propertyName.replace(/\s+/g, '_')}_all_layouts_${Date.now()}.zip`;
  saveAs(content, fileName);
}