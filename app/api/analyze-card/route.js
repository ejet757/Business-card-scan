export async function POST(request) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return Response.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Get API key from environment (server-side - safe!)
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extract base64 data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    // Call Claude API from the server (no CORS issues!)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `Look at this business card image and extract all contact information. Return ONLY a valid JSON object (no markdown, no extra text) with these fields (use null for missing data):
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "company": "",
  "email": "",
  "phone": "",
  "address": "",
  "website": ""
}`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      return Response.json(
        { error: `Claude API error: ${errorMsg}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
