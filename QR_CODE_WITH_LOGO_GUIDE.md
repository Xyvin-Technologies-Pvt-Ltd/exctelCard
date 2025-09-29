# QR Code with Company Logo - Implementation Guide

This guide explains how to create QR codes with your company logo at the center, similar to the design shown in your reference images.

## Features Implemented

### ✅ Frontend Components

- **QRCodeWithLogo.jsx**: Custom React component that overlays company logo on QR codes
- **QRCode.jsx**: Updated QR code page with logo integration
- **QRCodeDemo.jsx**: Interactive demo component for testing different configurations

### ✅ Backend API

- **QR Code Generation**: Server-side QR code generation with logo overlay
- **Database Storage**: MongoDB model for storing QR code data and analytics
- **REST API**: Complete CRUD operations for QR code management
- **Analytics**: Track QR code scans and usage statistics

## How It Works

### 1. QR Code Generation

The system generates QR codes with high error correction level (H) to ensure readability even with the logo overlay:

```javascript
// Frontend usage
<QRCodeWithLogo
  value="https://exctelcard.xyvin.com/share/your-share-id"
  size={200}
  logoSize={45}
  logoPath="/logo.png"
  level="H"
  bgColor="#FFFFFF"
  fgColor="#000000"
/>
```

### 2. Logo Positioning

- Logo is positioned at the center of the QR code
- Size is automatically limited to 25% of QR code size for readability
- White background with subtle border ensures logo visibility
- Fallback indicator if logo fails to load

### 3. Error Correction

- Uses QR code error correction level "H" (High)
- Allows up to 30% of QR code data to be obscured while maintaining readability
- Logo size is optimized to not interfere with critical QR code patterns

## Configuration Options

### QR Code Settings

- **Size**: 100px - 400px (recommended: 200px)
- **Logo Size**: 20px - 100px (recommended: 45px for 200px QR)
- **Error Level**: L, M, Q, H (recommended: H for logo overlay)
- **Colors**: Customizable background and foreground colors

### Logo Requirements

- **Format**: PNG, JPG, SVG supported
- **Size**: Square aspect ratio recommended
- **Path**: Place logo in `/frontend/public/logo.png`
- **Fallback**: System shows "LOGO" placeholder if image fails to load

## API Endpoints

### Generate QR Code with Logo

```http
POST /api/qr/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "shareId": "user-share-id",
  "qrData": "https://exctelcard.xyvin.com/share/user-share-id",
  "size": 200,
  "logoSize": 45,
  "logoPath": "/logo.png",
  "level": "H",
  "bgColor": "#FFFFFF",
  "fgColor": "#000000"
}
```

### Get QR Code History

```http
GET /api/qr/history
Authorization: Bearer <token>
```

### Track QR Code Scan

```http
POST /api/qr/{shareId}/scan
```

## Usage Examples

### 1. Basic QR Code with Logo

```jsx
import QRCodeWithLogo from "../components/QRCodeWithLogo";

<QRCodeWithLogo
  value="https://your-website.com"
  size={200}
  logoSize={50}
  logoPath="/logo.png"
/>;
```

### 2. Custom Styled QR Code

```jsx
<QRCodeWithLogo
  value="https://your-website.com"
  size={300}
  logoSize={60}
  logoPath="/logo.png"
  bgColor="#f0f0f0"
  fgColor="#333333"
  level="H"
/>
```

### 3. Download QR Code

The system supports downloading QR codes as:

- **PNG**: High-resolution raster image (recommended for printing)
- **SVG**: Vector format for web use

## Best Practices

### Logo Design

1. **Keep it simple**: Complex logos may not be readable at small sizes
2. **High contrast**: Ensure logo stands out against white background
3. **Square format**: Works best for center positioning
4. **Test readability**: Verify QR code still scans with logo overlay

### QR Code Size

1. **Minimum size**: 200px for good readability
2. **Logo ratio**: Keep logo under 25% of QR code size
3. **Error correction**: Always use level "H" for logo overlay
4. **Margin**: Include adequate white space around QR code

### Performance

1. **Image optimization**: Compress logo files for faster loading
2. **Caching**: QR codes are cached in database for quick access
3. **Lazy loading**: Logo images are preloaded before display

## Troubleshooting

### Common Issues

**QR Code doesn't scan:**

- Reduce logo size
- Increase QR code size
- Check error correction level is set to "H"
- Ensure logo doesn't cover finder patterns

**Logo not displaying:**

- Check logo file exists at specified path
- Verify file format is supported
- Check browser console for loading errors
- Ensure CORS is configured for image loading

**Download fails:**

- Check html2canvas is installed
- Verify browser supports canvas operations
- Try SVG download as fallback

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── QRCodeWithLogo.jsx    # Main QR component with logo
│   │   └── QRCodeDemo.jsx        # Demo component
│   ├── pages/
│   │   └── QRCode.jsx            # QR code page
│   └── api/
│       └── qrcode.js             # API functions
└── public/
    └── logo.png                  # Company logo

backend/
├── modules/
│   └── qrcode/
│       ├── qrcode.model.js       # Database model
│       ├── qrcode.controller.js  # API controller
│       └── qrcode.route.js       # API routes
└── package.json                  # Includes qrcode & canvas packages
```

## Dependencies

### Frontend

- `qrcode.react`: QR code generation
- `html2canvas`: Image download functionality
- `react-icons`: UI icons

### Backend

- `qrcode`: Server-side QR code generation
- `canvas`: Image manipulation and logo overlay
- `mongoose`: Database operations

## Next Steps

1. **Test the implementation** with your actual logo
2. **Customize colors** to match your brand
3. **Adjust logo size** based on your logo design
4. **Test QR code scanning** with various devices
5. **Implement analytics** to track QR code usage

The system is now ready to generate professional QR codes with your company logo at the center, maintaining excellent readability while showcasing your brand identity.







