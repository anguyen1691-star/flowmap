# Eastern Region FlowMapping

A modern workflow architecture diagram tool powered by AI. Design, visualize, and collaborate on workflow diagrams with natural language descriptions and voice input.

**Features:**
- ✨ Beautiful, intuitive canvas for creating workflow diagrams
- 🤖 AI-powered diagram generation using Claude Sonnet
- 🎤 Voice input via Web Speech API for hands-free workflow descriptions
- 📸 Export diagrams as PNG or PDF
- 🎨 Customizable node colors, text, and styling
- ♾️ Infinite canvas with pan, zoom, and snap-to-grid
- 💬 Multi-turn conversation support

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, html-to-image, jsPDF
- **Backend:** Node.js, Express
- **AI:** Claude Sonnet 4 (via Anthropic SDK)

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)

## Installation

### 1. Clone the Repository

```bash
cd eastern-region-flowmapping
```

### 2. Get Your Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys" in the settings
4. Create a new API key and copy it

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your API key:

```
ANTHROPIC_API_KEY=your-api-key-here
PORT=3001
```

**Note:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

## Running the App

You'll need to run both the backend and frontend servers. Open two terminal windows:

### Terminal 1: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
Server running on http://localhost:3001
API available at http://localhost:3001/api/chat
```

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3. Open in Browser

Click the link or open your browser and go to:
```
http://localhost:5173
```

## How to Use

### Creating & Resizing Nodes
1. Click **"+ Box"** in the toolbar
2. Click on the canvas where you want to place the node
3. Double-click a node to edit its label
4. **To resize**: Select a node, then drag any of the four orange corner handles
   - Drag corners to resize (minimum size enforced: 80×40px)

### Connecting Nodes
1. Click a node to select it
2. Orange handles appear on all four sides (top, bottom, left, right)
3. Drag from a handle to connect to another node
4. Edges automatically route around obstacles

### Customizing Node Colors
1. Click a node to select it
2. A style panel appears in the top-right corner
3. Choose a color from the 15 available swatches
4. All nodes have rounded corners by default

### Using AI to Generate Diagrams
1. Scroll to the bottom "Claude AI" panel
2. Describe your workflow in plain English:
   - "Create a data pipeline with S3, Lambda, and DynamoDB"
   - "Add monitoring and alerting nodes to this workflow"
   - "Make the node colors blue and teal"
3. Press Enter or click the arrow button to send
4. Claude generates or modifies the diagram automatically

### Voice Input
1. Click the **🎤** microphone button
2. Speak your workflow description
3. The transcript auto-fills the input field
4. Click Send or press Enter to generate the diagram

### Exporting Diagrams
- **PNG Export:** Click **"↓ PNG"** to download as `flowmap.png`
- **PDF Export:** Click **"↓ PDF"** to download as `flowmap.pdf` (A4 landscape)

### Navigation
- **Pan:** Click and drag on the canvas background
- **Zoom:** Use your mouse scroll wheel (Ctrl+scroll on some platforms)
- **Zoom Controls:** Use the +, fit, − buttons in the bottom-left

## Troubleshooting

### "Failed to connect to API"
- Ensure the backend is running on `http://localhost:3001`
- Check that you see "Server running..." in your backend terminal
- Verify no other service is using port 3001

### "API error: 401"
- Your `ANTHROPIC_API_KEY` is missing or invalid
- Double-check the `.env` file in the `backend` directory
- Make sure there are no extra spaces or quotes in the key

### "Speech Recognition not supported"
- Voice input requires a modern browser (Chrome, Edge, Safari)
- Firefox has limited support
- The app still works with text input

### "Export button not working"
- Ensure you have at least one node on the canvas
- Check browser console for errors (F12)
- Try exporting a simpler diagram first

## Project Structure

```
eastern-region-flowmapping/
├── backend/
│   ├── server.js              # Express server + Claude API integration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Styles + Tailwind
│   │   ├── components/
│   │   │   ├── Toolbar.jsx
│   │   │   ├── Canvas.jsx
│   │   │   ├── Node.jsx
│   │   │   ├── StylePanel.jsx
│   │   │   └── AIPanel.jsx
│   │   ├── hooks/
│   │   │   └── useSpeechRecognition.js
│   │   └── utils/
│   │       ├── api.js         # Backend communication
│   │       ├── export.js      # PNG/PDF export
│   │       └── edges.js       # Edge routing logic
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .gitignore
└── README.md
```

## Color Palette

The app uses a carefully chosen color palette:

- **Amber:** `#F8BC24` - Primary accent, branding
- **Orange:** `#F58800` - Secondary accent, buttons
- **Navy:** `#051821` - Toolbar, edges, text
- **Dark Teal:** `#1A4645` - Default node color
- **Teal:** `#266867` - Group containers
- Plus 10 more colors for node customization

## API Reference

### POST `/api/chat`

Generates or modifies workflow diagrams via Claude.

**Request:**
```json
{
  "message": "Create a Lambda-based API with DynamoDB",
  "diagramState": {
    "nodes": [...],
    "edges": [...]
  },
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "reply": "I've created a Lambda API with DynamoDB...",
  "diagram": {
    "nodes": [...],
    "edges": [...]
  },
  "message": "Full response text..."
}
```

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses --watch mode
```

**Frontend:**
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`.

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 15+
- Edge 90+

## Tips & Tricks

1. **Snap to Grid:** All nodes automatically snap to a 24px grid for alignment
2. **Smart Routing:** Edges automatically curve around obstacles
3. **Multi-turn Edits:** Claude remembers your conversation context for iterative updates
4. **Custom Labels:** Double-click any node to edit its name instantly
5. **Context Menu:** Right-click a node to delete it

## Keyboard Shortcuts

- **Enter** (in AI panel) - Send message
- **Escape** (while editing) - Cancel node label edit
- **Mouse Wheel** - Zoom in/out
- **Drag Background** - Pan canvas

## Limitations

- Maximum recommended diagram size: ~100 nodes (performance may degrade beyond this)
- Export resolution is limited by your screen's pixel density
- Voice input requires microphone permission in your browser

## License

MIT

## Support

For issues, questions, or feedback:
1. Check the troubleshooting section above
2. Review the browser console for error messages (F12)
3. Verify backend and frontend are both running

Enjoy building workflow diagrams! 🚀
