export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const SALESFORCE_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;
  const BASE_URL = 'https://in1750257229223.my.salesforce.com';

  try {
    const response = await fetch(
      `${BASE_URL}/services/data/v64.0/actions/custom/flow/Send_Slack_Message_for_Hyper_Assist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SALESFORCE_ACCESS_TOKEN}`
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[call-flow] Error:', err);
    res.status(500).json({ error: 'Failed to call flow' });
  }
}
