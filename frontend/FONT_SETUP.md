# Aktiv Grotesk Font Setup

## Font Integration Complete ✅

The Aktiv Grotesk font has been integrated throughout your application. Here's how to use it:

## Usage Options

### 1. Automatic (Default)

The font is now the default font for the entire application. All text will automatically use Aktiv Grotesk.

### 2. Tailwind Classes

You can use these Tailwind classes for specific font weights:

```jsx
// Font weights
<h1 className="font-bold">Bold Text</h1>
<h2 className="font-semibold">SemiBold Text</h2>
<h3 className="font-medium">Medium Text</h3>
<p className="font-normal">Regular Text</p>
<p className="font-light">Light Text</p>

// Font family (redundant since it's default)
<div className="font-sans">Uses Aktiv Grotesk</div>
<div className="font-aktiv">Explicitly uses Aktiv Grotesk</div>
```

### 3. CSS Classes

You can also use the custom CSS classes:

```jsx
<h1 className="font-aktiv-bold">Bold Heading</h1>
<h2 className="font-aktiv-semibold">SemiBold Heading</h2>
<h3 className="font-aktiv-medium">Medium Heading</h3>
<p className="font-aktiv-regular">Regular Text</p>
<p className="font-aktiv-light">Light Text</p>
```

## Font Files Location

The font files should be placed in:

```
frontend/public/Aktiv Grotesk/TTF/
frontend/public/Aktiv Grotesk/OTF/
```

## Available Font Weights

- 300 (Light)
- 400 (Regular)
- 500 (Medium)
- 600 (SemiBold)
- 700 (Bold)

## Fallback Fonts

If Aktiv Grotesk fails to load, the system will fallback to:

1. System UI fonts
2. Apple system fonts
3. Segoe UI
4. Roboto
5. Helvetica Neue
6. Arial
7. Generic sans-serif

## Testing the Font

To verify the font is working, check the browser's developer tools:

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for font file requests
5. In Elements tab, inspect any text element to see the computed font-family

## Troubleshooting

If the font doesn't load:

1. Check that font files are in the correct directory
2. Verify file names match the @font-face declarations
3. Check browser console for 404 errors
4. Ensure font files are not corrupted

## Performance Notes

- Font files are loaded with `font-display: swap` for better performance
- Fallback fonts ensure text is always visible
- Font files are cached by the browser after first load
