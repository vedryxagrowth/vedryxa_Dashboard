import { UAParser } from "ua-parser-js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { name = "Unknown" } = req.query;

    const userAgent = req.headers["user-agent"] || "Unknown";
    console.log("User-Agent:", userAgent);

    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    let deviceType = device?.type || "desktop";

    let ip = "Unknown";
    try {
      const ipRes = await fetch("https://api64.ipify.org?format=json");
      if (!ipRes.ok) throw new Error("Failed to fetch IP address");
      const ipData = await ipRes.json();
      ip = ipData.ip || "Unknown";
    } catch (error) {
      console.error("Error fetching IP aaddress:", error);
    }

    let location = {
      status: "Unknown",
      country: "Unknown",
      countryCode: "Unknown",
      region: "Unknown",
      regionName: "Unknown",
      city: "Unknown",
      zip: "Unknown",
      lat: "Unknown",
      lon: "Unknown",
      timezone: "Unknown",
      isp: "Unknown",
      org: "Unknown",
      as: "Unknown",
      query: ip,
    };

    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      if (!geoRes.ok) throw new Error("Failed to fetch location data");
      const geoData = await geoRes.json();
      if (geoData.status === "success") {
        location = { ...geoData };
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }

    // Get current timestamp in IST
    const now = new Date();
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const istTimestamp = istFormatter.format(now);

    return res.status(200).json({
      timestamp: istTimestamp,
      ip,
      location,
      device: {
        type: deviceType,
      },
      userAgent,
      name,
    });
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
