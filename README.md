# Business Card Scanner

A web-based application to scan business cards using your camera or upload images, extract contact information with AI-powered OCR, and export to CSV (compatible with Excel and Google Sheets).

## Features

- 📷 **Camera Capture** - Take photos of business cards directly from your device
- 📁 **Image Upload** - Upload existing images of business cards
- 🤖 **AI-Powered Extraction** - Uses Tesseract OCR and Claude API to intelligently extract contact data
- 📌 **Event Tracking** - Optional event name field to organize contacts by event
- 📊 **CSV Export** - Download contacts as CSV file compatible with Excel and Google Sheets
- 🎯 **Clean UI** - Modern, responsive design

## Technology Stack

- **Frontend**: React 18, Next.js 14
- **OCR**: Tesseract.js
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel (free tier)

## Environment Variables

You'll need a Claudeapi key to use this app. Get one at https://console.anthropic.com/

The app runs in the browser - no backend server needed. Your API key is used directly from the client side.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Deployment on Vercel

See VERCEL_DEPLOYMENT.md for step-by-step instructions.

## How It Works

1. **Capture/Upload**: Take a photo of a business card or upload an image
2. **OCR Processing**: Tesseract.js extracts text from the image
3. **AI Parsing**: Claude API intelligently structures the extracted text into contact fields
4. **Storage**: Contacts are stored in your browser (localStorage)
5. **Export**: Download as CSV file to use in Excel or Google Sheets

## Data Privacy

- Images are processed and discarded immediately
- Contact data is stored only in your browser's storage
- No data is sent to any server except:
  - The image data to Claude API for text extraction
  - Your API key authenticates the request

## Support

For issues or questions, check the troubleshooting section in VERCEL_DEPLOYMENT.md
