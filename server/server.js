const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // allow all origins for now
app.use(express.json());

const SALESFORCE_ACCESS_TOKEN = 'eyJ0bmsiOiJjb3JlL3Byb2QvMDBESG8wMDAwMDdFWFNWTUE0IiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMERIbzAwMDAwN0VYU1YuMTc1MDI2MjIxNTMwNSIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJzZmFwX2FwaSBjaGF0Ym90X2FwaSBhcGkiLCJzdWIiOiJ1aWQ6MDA1SG8wMDAwMDkzZlJxSUFJIiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL2luMTc1MDI1NzIyOTIyMy5teS5zYWxlc2ZvcmNlLmNvbSIsImNsaWVudF9pZCI6IjNNVkc5UnIwRVoyWU9WTWFVaWlNMl81TzlMem5PUmc2TVZMRk9QbFZxaElTLnNGYVpEUzRRbDBRa0xfWUloNGVsci51QW5sSE40RGV1MzFXUFh2X00iLCJjZHBfdGVuYW50IjoiYTM2MC9wcm9kLzQ3NjdkMjIwZGUxMDRiYzBhODlkNGFiNzM5ZGJjNmU0IiwiYXVkIjpbImh0dHBzOi8vaW4xNzUwMjU3MjI5MjIzLm15LnNhbGVzZm9yY2UuY29tIiwiaHR0cHM6Ly9hcGkuc2FsZXNmb3JjZS5jb20iXSwibmJmIjoxNzUxNzgzMzExLCJtdHkiOiJvYXV0aCIsInNmYXBfcmgiOiJib3Qtc3ZjLWxsbTphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixib3Qtc3ZjLWxsbS9GbG93R3B0OmF3cy1wcm9kMS11c2Vhc3QxL2VpbnN0ZWluLGJvdC1zdmMtbGxtL0VEQzphd3MtcHJvZDEtdXNlYXN0MS9laW5zdGVpbixlaW5zdGVpbi10cmFuc2NyaWJlL0VpbnN0ZWluR1BUOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluLG12cy9FREM6YXdzLXByb2QxLXVzZWFzdDEvZWluc3RlaW4sZWluc3RlaW4tYWktZ2F0ZXdheS9FaW5zdGVpbkdQVDphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixlaW5zdGVpbi1haS1nYXRld2F5L0VEQzphd3MtcHJvZDEtdXNlYXN0MS9laW5zdGVpbiIsInNmaSI6IjEyMzQzNGIzN2FmMGU2ZjMyMDg2NTM1YWVjYmFiYmJlMjdlOTQ1NzRhOTUxOGY3ZDdlYjg3YTgzYzBkZmE4OTUiLCJzZmFwX29wIjoiRWluc3RlaW5IYXdraW5nQzJDRW5hYmxlZCxFR3B0Rm9yRGV2c0F2YWlsYWJsZSxFaW5zdGVpbkdlbmVyYXRpdmVTZXJ2aWNlLFRhYmxlYXVNZXRyaWNCYXNpY3MsU2FsZXNmb3JjZUNvbmZpZ3VyYXRvckVuZ2luZSIsImhzYyI6ZmFsc2UsImNkcF91cmwiOiJodHRwczovL2EzNjAuY2RwLmNkcDMuYXdzLXByb2QxLXVzZWFzdDEuYXdzLnNmZGMuY2wiLCJleHAiOjE3NTE3ODUxMjYsImlhdCI6MTc1MTc4MzMyNn0.SYJ_hlfce7gA8ppcU7avDoOAbc0le19yUp_qtfLLgGf3BasOFgyftxEfTkEQ_B-u5UVPVR-Uhup9XU3cBJy1NdHCzFmHlA_NyEmSQtVU2zwtQtVXQsphAgkoCTBZ4KHgrfnA5ddcj0h3n3Uc69pCc4O7uIartk_UBm6ZDuo62ylqPZ5BvJlmHwH1ylcBUfg5xXmZK0gEHV-CyP9PO4otSSnvGMJMy3hGjRry9QUr5iWwvlce2LzEuMY4W4Np-JKbg-e0wNTPWkZdSgTEL_nlTjeL2viCpWgIYVE8pRmTZwesiUoBmTyJRjQUxwYEBUHDA-wFof_CeqUV9S4Al39ESA'
const BASE_URL_TEMPLATE = 'https://in1750257229223.my.salesforce.com';
const AGENT_ENDPOINT = 'https://api.salesforce.com/einstein/ai-agent/v1/agents/0XxHo0000011VDGKA2/sessions';


app.post('/agent', async (req, res) => {
  try {
    const bodyAgent = req.body
    console.log('BDY '+req.body)
    const response = await fetch(AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(bodyAgent)
    });

    const data = await response.json();
    res.status(response.status).json(data);
    console.log('Body '+JSON.stringify(data))
  } catch (error) {
    console.error('Error forwarding to Salesforce:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const BASE_URL = 'https://api.salesforce.com/einstein/ai-agent/v1';

// Helper: determine agent ID based on condition
function getAgentIdByCondition(condition) {
  if (condition === 'WednesdAI') {
    return '0XxHo0000011WKrKAM';
  } else if (condition === 'cafe') {
    return '0XxHo0000011VDGKA2';
  } /*else {
    return '0XxHo0000011VDGKA2';
  }*/
}

// Step 1: Create a session
app.post('/create-session', async (req, res) => {
  try {
    const { topic } = req.body;
    console.log(topic);
    const agentId = getAgentIdByCondition(topic);

    const body = JSON.stringify({
          externalSessionKey:'AgentAPIDEMO',
          instanceConfig:{
              endpoint:'https://in1750257229223.my.salesforce.com'
          },
          featureSupport:'Streaming',
          streamingCapabilities:{
              chunkTypes:['Text']
          },
          bypassUser:true
      });

    const response = await fetch(`${BASE_URL}/agents/${agentId}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
      },
      body: body
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[create-session] Error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Step 2: Send message to session
app.post('/session/:sessionId/message', async (req, res) => {
  console.log('Body' + req.body)
  const sessionId = req.params.sessionId;
  try {
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('DATA '+JSON.stringify(data))
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[message] Error for session ${sessionId}:`, err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});


app.post('/call-template', async (req, res) => {
  try {
    console.log('called');
    console.log(req.body);
    // const body = JSON.stringify({
    //       isPreview: false,
    //       inputParams:{
    //           valueMap:{
    //             "Input:userQuery" : {
    //               value : 'Hii'
    //             }
    //           }
    //       },
    //       additionalConfig:{
    //         numGenerations: '1',
    //         temperature: '0.0',
    //         applicationName: 'PromptTemplateGenerationsInvocable'
    //       }
    //   });

    const response = await fetch(`${BASE_URL_TEMPLATE}/services/data/v64.0/einstein/prompt-templates/Return_Relevant_Materials/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[call-template] Error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.post('/call-flow', async (req, res) => {
  try {
    console.log('called');
    console.log(req.body);
    // const body = JSON.stringify({
    //       isPreview: false,
    //       inputParams:{
    //           valueMap:{
    //             "Input:userQuery" : {
    //               value : 'Hii'
    //             }
    //           }
    //       },
    //       additionalConfig:{
    //         numGenerations: '1',
    //         temperature: '0.0',
    //         applicationName: 'PromptTemplateGenerationsInvocable'
    //       }
    //   });

    const response = await fetch(`${BASE_URL_TEMPLATE}/services/data/v64.0/actions/custom/flow/Send_Slack_Message_for_Hyper_Assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[call-flow] Error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});