import axios from "axios";

export function ipfsUriToHttpUri(ipfsUri?: string): string {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
    throw new Error(`Fail to converting IPFS URI to HTTP URI: ${ipfsUri}`);
  }
  return ipfsUri.replace("ipfs://", "https://w3s.link/ipfs/");
}

export async function loadJsonFromIpfs(uri: string) {
  const response = await axios.get(ipfsUriToHttpUri(uri));
  if (response.data.errors) {
    throw new Error(`Fail to loading json from IPFS: ${response.data.errors}`);
  }
  return response.data;
}

export async function loadProfileUriDataFromIpfs(profileUri: string): Promise<{
  isProfileEnabledNotifications?: boolean;
  profileEmail?: string;
}> {
  let isProfileEnabledNotifications;
  let profileEmail;
  const profileUriData = await loadJsonFromIpfs(profileUri);
  for (const attribute of profileUriData.attributes) {
    if (attribute.trait_type === "notifications enabled") {
      isProfileEnabledNotifications = attribute.value;
    }
    if (attribute.trait_type === "email") {
      profileEmail = attribute.value;
    }
  }
  return {
    isProfileEnabledNotifications,
    profileEmail,
  };
}
