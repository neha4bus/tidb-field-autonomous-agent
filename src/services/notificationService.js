const axios = require('axios');

class NotificationService {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async sendSlackAlert(contractTitle, riskLevel, summary) {
    if (!this.slackWebhookUrl) {
      console.log('Slack webhook not configured, skipping notification');
      return;
    }

    const color = this.getRiskColor(riskLevel);
    const message = {
      text: `Contract Analysis Complete: ${contractTitle}`,
      attachments: [
        {
          color: color,
          fields: [
            {
              title: "Contract",
              value: contractTitle,
              short: true
            },
            {
              title: "Risk Level",
              value: riskLevel,
              short: true
            },
            {
              title: "Summary",
              value: summary,
              short: false
            }
          ],
          footer: "Smart Contract Analysis Agent",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(this.slackWebhookUrl, message);
      console.log('Slack notification sent successfully');
    } catch (error) {
      console.error('Error sending Slack notification:', error.message);
    }
  }

  async sendEmailAlert(email, contractTitle, report) {
    // Placeholder for email integration
    console.log(`Email alert would be sent to ${email} for contract: ${contractTitle}`);
    return {
      success: true,
      message: 'Email notification queued'
    };
  }

  getRiskColor(riskLevel) {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'good';
      default: return '#36a64f';
    }
  }
}

module.exports = NotificationService;