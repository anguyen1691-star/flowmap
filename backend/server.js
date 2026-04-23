import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config({ override: true });

const app = express();
app.use(cors({
  origin: ['https://flowmap-emr.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an expert workflow architecture assistant for the Eastern Region FlowMapping tool. Users describe workflows or request modifications to diagrams.

Your task is to generate or modify workflow diagrams as JSON structures representing nodes and edges.

Respond with:
1. A short, friendly explanation (1-3 sentences) of what you created or changed
2. A JSON code block with the diagram structure

The JSON format MUST be:
\`\`\`json
{
  "nodes": [
    { "id": "1", "label": "Node Name", "color": "#1A4645", "x": 100, "y": 150, "width": 160, "height": 52, "rounded": true }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2", "sourceHandle": "right", "targetHandle": "left", "label": "" }
  ]
}
\`\`\`

Node guidelines:
- Node IDs: short descriptive strings ("start", "process", "db", "end", "1", "2", etc.)
- Colors from palette: #1A4645 (dark teal, default), #266867 (teal), #F58800 (orange), #F8BC24 (amber), #4F6D8A (slate), #051821 (navy), #F05223 (red-orange), #ffffff (white), #333333 (dark)
- Width 160, height 52 for regular nodes; larger (200-280 wide, 60-80 tall) for important/complex ones
- Layout: left-to-right flow with 180-220px horizontal spacing, 80-120px vertical spacing
- Start nodes top-left area; end nodes bottom-right area

Edge guidelines (CRITICAL — always include both handle fields):
- sourceHandle: which side the edge leaves from — "right", "left", "top", or "bottom"
- targetHandle: which side the edge enters — "right", "left", "top", or "bottom"
- For left-to-right flow: sourceHandle "right", targetHandle "left"
- For top-to-bottom flow: sourceHandle "bottom", targetHandle "top"
- For branching (one source to multiple): use "bottom" or "right" from source
- Choose handles so edges don't cross unnecessarily
- ALWAYS set label to "" (empty string) — never add text labels to edges

When modifying existing diagrams:
- Preserve existing node IDs
- Only change what the user requested
- To add nodes, include ALL existing nodes plus the new ones

IMPORTANT: Always output the JSON in a \`\`\`json code block. Keep your explanation brief and friendly.`;


app.post('/api/chat', async (req, res) => {
  try {
    const { message, diagramState, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [];

    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    let userMessage = message;
    if (diagramState) {
      userMessage += `\n\nCurrent diagram state:\n${JSON.stringify(diagramState, null, 2)}`;
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0].text;

    // Try code block first, then bare JSON object
    const codeBlockMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    const bareJsonMatch = assistantMessage.match(/\{[\s\S]*"nodes"[\s\S]*"edges"[\s\S]*\}/);
    let diagramJson = null;

    const rawJson = codeBlockMatch?.[1] || bareJsonMatch?.[0];
    if (rawJson) {
      try {
        diagramJson = JSON.parse(rawJson);
        // Always clear edge labels — they clutter the canvas
        if (diagramJson.edges) {
          diagramJson.edges = diagramJson.edges.map(e => ({ ...e, label: '' }));
        }
      } catch (e) {
        console.error('Failed to parse diagram JSON:', e);
      }
    }

    // Reply is everything before the code block (or before the raw JSON)
    const reply = assistantMessage.split(/```json|\{[\s\S]*"nodes"/)[0].trim();

    res.json({
      reply: reply || assistantMessage,
      diagram: diagramJson,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/chat`);
});
