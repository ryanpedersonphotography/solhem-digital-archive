#!/bin/bash

# Process Fred 2025 event photos
SOURCE_DIR="fred"
DEST_DIR="public/events/2025/fred"
MAX_WIDTH=4096
QUALITY=85

echo "Processing Fred 2025 event photos..."
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"

# Count total files
TOTAL=$(find "$SOURCE_DIR" -name "*.jpg" | wc -l | tr -d ' ')
COUNT=0

# Process each image
for img in "$SOURCE_DIR"/*.jpg; do
    COUNT=$((COUNT + 1))
    filename=$(basename "$img")
    
    # Progress indicator
    echo "[$COUNT/$TOTAL] Processing $filename..."
    
    # Resize to max width 4096px and compress with quality 85%
    magick "$img" \
        -resize "${MAX_WIDTH}x>" \
        -quality "$QUALITY" \
        -strip \
        "$DEST_DIR/$filename"
done

echo ""
echo "✅ Completed processing $TOTAL images!"
echo "Images saved to: $DEST_DIR"

# Show size comparison
ORIGINAL_SIZE=$(du -sh "$SOURCE_DIR" | cut -f1)
NEW_SIZE=$(du -sh "$DEST_DIR" | cut -f1)
echo ""
echo "Size comparison:"
echo "  Original: $ORIGINAL_SIZE"
echo "  Processed: $NEW_SIZE"