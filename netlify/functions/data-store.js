// Use dynamic import for ES module
let Octokit;

// Initialize GitHub API client
const getOctokit = async () => {
  if (!Octokit) {
    const octokitModule = await import('@octokit/rest');
    Octokit = octokitModule.Octokit;
  }
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  return new Octokit({ auth: token });
};

// Repository configuration
const REPO_CONFIG = {
  owner: 'ryanpedersonphotography', // Your GitHub username
  repo: 'solhem-digital-archive',   // Your repo name
  branch: 'main'
};

// Data file paths in the repo
const DATA_FILES = {
  hidden: 'data/hidden-photos.json',
  ratings: 'data/photo-ratings.json',
  tags: 'data/photo-tags.json',
  flags: 'data/flagged-photos.json'
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const octokit = await getOctokit();
    const { httpMethod, path, body } = event;
    
    // Parse the data type from the path
    const pathParts = path.split('/');
    const dataType = pathParts[pathParts.length - 1]; // e.g., 'hidden', 'ratings', 'tags'
    
    if (!DATA_FILES[dataType]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid data type: ${dataType}` })
      };
    }

    const filePath = DATA_FILES[dataType];

    switch (httpMethod) {
      case 'GET':
        // Read data from GitHub
        try {
          const { data } = await octokit.rest.repos.getContent({
            ...REPO_CONFIG,
            path: filePath
          });
          
          const content = Buffer.from(data.content, 'base64').toString('utf8');
          return {
            statusCode: 200,
            headers,
            body: content
          };
        } catch (error) {
          if (error.status === 404) {
            // File doesn't exist yet, return empty data structure
            const emptyData = getEmptyDataStructure(dataType);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(emptyData)
            };
          }
          throw error;
        }

      case 'PUT':
        // Write data to GitHub
        const newContent = JSON.parse(body);
        
        // Get current file to get SHA (required for updates)
        let sha;
        try {
          const { data } = await octokit.rest.repos.getContent({
            ...REPO_CONFIG,
            path: filePath
          });
          sha = data.sha;
        } catch (error) {
          // File doesn't exist yet, that's okay
          sha = undefined;
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          ...REPO_CONFIG,
          path: filePath,
          message: `Update ${dataType} data via Netlify Function`,
          content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
          sha: sha
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: `${dataType} data updated` })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Helper function to return empty data structures
function getEmptyDataStructure(dataType) {
  switch (dataType) {
    case 'hidden':
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        hiddenPhotos: {}
      };
    case 'ratings':
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        ratings: {}
      };
    case 'tags':
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        photoTags: {}
      };
    case 'flags':
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        flaggedPhotos: {}
      };
    default:
      return {};
  }
}