const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/main.js');

// --- Mocking the Ollama Module ---
jest.mock('ollama', () => {
  const mockStream = async function* () {
    yield { response: 'Yea, ' };
    yield { response: 'you ' };
    yield { response: 'are ' };
    yield { response: 'right.' };
  };

  return {
    Ollama: jest.fn().mockImplementation(() => ({
      generate: jest.fn().mockResolvedValue(mockStream()),
    })),
  };
});

const logFilePath = path.join(__dirname, '..', 'logs', 'log.jsonl');

describe('POST /generate', () => {
  // Delete logs for a clean slate.
  beforeEach(() => {
    fs.rmSync(logFilePath, { force: true });
  });

  // --- Test for a successful stream ---
  it('should stream tokens and create a correct log file', async () => {
    const requestPayload = { prompt: "The sky is so bright." };
    const expectedFullResponse = "Yea, you are right.";

    // Act
    const response = await request(app)
      .post('/generate')
      .send(requestPayload)
      .expect('Content-Type', /event-stream/)
      .expect(200); 

    // Assert
    expect(response.text).toContain('Yea,');
    expect(response.text).toContain('right.');
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    const loggedJson = JSON.parse(logContent.trim());
    expect(loggedJson.output.response).toEqual(expectedFullResponse);
  });

  // --- Test case for an empty prompt ---
  it('should return a 400 error if the prompt is missing', async () => {
    const requestPayload = { prompt: "" }; // Empty prompt
    const expectedError = { error: "Prompt is required." };

    // Act
    const response = await request(app)
      .post('/generate')
      .send(requestPayload)
      .expect('Content-Type', /json/)
      .expect(400);

    // Assert
    expect(response.body).toEqual(expectedError);
  });
});