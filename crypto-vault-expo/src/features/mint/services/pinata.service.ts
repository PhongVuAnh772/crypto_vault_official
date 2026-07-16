const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDEwZWU5Ny1hZTQxLTRlNDctODM0MS0xNWY1M2VhMjZlN2MiLCJlbWFpbCI6InZ1YW5ocGhvbmcxNzAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0OWRiNWM5MjhiOWU2YjgzMGU1ZCIsInNjb3BlZEtleVNlY3JldCI6IjRiMDVkODYxMDMwYzc0YjIyOWUxNDMwNWVkMWY3OGE0OTkzMWVmNzFhMzc3YWQ0ZDNhMjNiY2YzMzg0YmMwZmIiLCJleHAiOjE4MDIzNDAwNjd9.VaHBdD307nGIwBRqwh1xyCPzmEmj1leYTKwQKVsjYlc";

export class PinataService {
  static async uploadFile(uri: string, name = "file.png") {
    const data = new FormData();

    data.append("file", {
      uri,
      name,
      type: "image/png",
    } as any);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Pinata failed: ${errText}`);
    }

    const json = await res.json();
    return json.IpfsHash;
  }

  static async uploadJSON(jsonBody: any) {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("Pinata JSON upload failed: " + text);
    }

    const json = await res.json();

    return json.IpfsHash;
  }
}
