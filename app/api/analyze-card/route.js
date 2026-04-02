export async function POST(request) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from environment (server-side - safe!)
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    console.log('Server: API key available:', !!apiKey);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    console.log('Server: Image data ready, length:', base64Data.length);

    // Call Claude API from the server (no CORS issues!)
    console.log('Server: Calling Claude API...');
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

    console.log('Server: Claude API response status:', claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || claudeResponse.statusText;
      console.error('Server: Claude API error:', errorMsg);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${errorMsg}` }),
        { status: claudeResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await claudeResponse.json();
    console.log('Server: Claude API response received');
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server: API route error:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
