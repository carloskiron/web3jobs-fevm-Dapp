import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["POST", "HEAD"]
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  //check the expected method
  if (req.method === "POST") { // or GET, PUT, DELETE ...

    try {
      const { method, params=undefined } = req.body;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: 1,
        }),
      };
      const result = await fetch("https://wallaby.node.glif.io/rpc/v0", options);
      const methodResult = await result.json();
      return res.status(200).json(methodResult);
      
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  return res.status(404).json({
    error: {
      code: "not_found",
      message: "The requested endpoint was not found or doesn't support this method."
    }
  });

}

export default handler;