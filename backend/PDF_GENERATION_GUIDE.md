# Business Card PDF Generation Guide

## Overview

This guide explains the business card PDF generation system that creates professional 2-page PDF business cards with user information and QR codes.

## Features

- **2-Page PDF Generation**: Creates front and back business card pages
- **User Data Integration**: Populates user information with proper formatting
- **QR Code Generation**: Embeds QR codes with company logo
- **Template Support**: Uses custom card front/back images as templates
- **Batch Processing**: Generate multiple business cards at once
- **Activity Tracking**: Tracks download analytics

## Architecture

### Components

1. **PDFGeneratorService** (`services/pdfGenerator.js`)

   - Main service for PDF generation
   - Handles template integration
   - Manages user data population

2. **Share Controller** (`modules/share/share.controller.js`)

   - HTTP endpoint for PDF download
   - User authentication and validation
   - Activity tracking

3. **QR Code Service** (`services/qrCodeService.js`)
   - Generates QR codes with company logo
   - Handles caching and versioning

### Template Assets

- `assets/cardfront.jpg` - Company information side (back page)
- `assets/cardback.jpg` - User information side (front page)
- `assets/logo.png` - Company logo for QR codes

## API Endpoints

### Download Business Card PDF

```
GET /api/share/:shareId/downloadBizCard
```

**Parameters:**

- `shareId` (string, required): User's share ID

**Response:**

- Returns PDF file with appropriate headers
- Filename: `business-card-{name}-{shareId}.pdf`

**Example:**

```bash
curl -X GET "http://localhost:5000/api/share/abc123/downloadBizCard" \
     -H "Accept: application/pdf" \
     --output business-card.pdf
```

## Usage Examples

### Basic PDF Generation

```javascript
const PDFGeneratorService = require("./services/pdfGenerator");

// Generate PDF for a single user
const pdfBuffer = await PDFGeneratorService.generateBusinessCardPDF(
  user,
  baseUrl,
  options
);
```

### Batch PDF Generation

```javascript
// Generate PDFs for multiple users
const results = await PDFGeneratorService.batchGenerateBusinessCards(
  users,
  baseUrl,
  options
);

// Process results
results.forEach((result) => {
  if (result.success) {
    console.log(`Generated PDF for ${result.user.name}`);
    // result.pdf contains the PDF buffer
  } else {
    console.error(`Failed for ${result.user.name}: ${result.error}`);
  }
});
```

### Save PDF to File

```javascript
// Generate and save PDF to file
const outputPath = await PDFGeneratorService.generateAndSaveBusinessCard(
  user,
  baseUrl,
  "./output/business-card.pdf",
  options
);
```

## Configuration Options

### PDF Generation Options

```javascript
const options = {
  size: 120, // QR code size in pixels
  logoSize: 30, // Logo size within QR code
  errorCorrectionLevel: "H", // QR code error correction level
};
```

### Card Dimensions

- **Standard Business Card Size**: 85mm x 55mm
- **PDF Points**: 240.94 x 155.87 points (72 points per inch)

## User Data Mapping

The PDF generator maps user data to specific card positions:

### Front Page (User Information)

- **Name**: Large, bold text at top
- **Job Title**: Below name in smaller text
- **Email**: With email icon
- **Phone**: With phone icons (mobile + WhatsApp)
- **Address**: With location icon, supports multi-line
- **Website**: With globe icon
- **QR Code**: Bottom center with white background

### Back Page (Company Information)

- Uses `cardfront.jpg` template with company branding
- No user-specific data overlay

## Error Handling

The service includes comprehensive error handling:

1. **Missing User Data**: Graceful fallbacks for missing fields
2. **QR Code Generation**: Fallback to fresh generation if database fails
3. **Template Loading**: Error handling for missing template files
4. **PDF Generation**: Proper error propagation with meaningful messages

## Performance Considerations

### Optimization Features

1. **QR Code Caching**: QR codes are cached in database with versioning
2. **Batch Processing**: Efficient processing of multiple users
3. **Memory Management**: Proper cleanup of PDF buffers
4. **Error Recovery**: Continues processing even if individual users fail

### Memory Usage

- Each PDF: ~1.2MB (typical size)
- Batch processing: Processes users sequentially to manage memory
- Buffer cleanup: Automatic cleanup after PDF generation

## Testing

The system includes comprehensive testing capabilities:

### Test Data Structure

```javascript
const sampleUser = {
  _id: "test-user-id",
  name: "John Doe",
  email: "john.doe@exctel.com",
  jobTitle: "Software Developer",
  phone: "+65 1234 5678",
  phone2: "+65 8765 4321",
  address: "123 Main Street\nSingapore 123456",
  department: "Engineering",
  shareId: "test-share-id",
};
```

### Testing Commands

```bash
# Test single PDF generation
node test-pdf-generation.js

# Test batch PDF generation
node test-batch-pdf-generation.js
```

## Troubleshooting

### Common Issues

1. **QR Code Generation Errors**

   - Check if user has valid shareId
   - Verify QR code service dependencies (canvas, qrcode)

2. **Template Loading Errors**

   - Ensure template files exist in `assets/` directory
   - Check file permissions and formats (JPG/PNG)

3. **PDF Generation Errors**

   - Verify PDFKit installation
   - Check available memory for large batch operations

4. **User Data Issues**
   - Ensure required fields (name, email, shareId) are present
   - Check data format and encoding

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=pdf-generator node app.js
```

## Security Considerations

1. **Input Validation**: All user inputs are validated
2. **File Access**: Restricted access to template files
3. **Rate Limiting**: Implemented at controller level
4. **Activity Tracking**: Secure tracking of download activities

## Future Enhancements

1. **Custom Templates**: Support for user-customizable templates
2. **Multiple Formats**: Support for different card sizes/formats
3. **Advanced Styling**: More customization options for fonts/colors
4. **Preview Generation**: Generate preview images before PDF
5. **Watermarking**: Add security watermarks to generated PDFs

## Dependencies

- `pdfkit`: PDF generation library
- `canvas`: Image manipulation and QR code generation
- `qrcode`: QR code generation
- `fs`: File system operations
- `path`: Path utilities

## License

This PDF generation system is part of the Exctel Digital Business Card platform.
