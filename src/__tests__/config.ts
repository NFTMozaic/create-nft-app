import * as dotenv from "dotenv";
dotenv.config();

function getConfig() {
  const { PINATA_JWT, PINATA_GATEWAY, MNEMONIC } = process.env;
  if (!PINATA_JWT || !MNEMONIC) throw Error("Did you forget to set .env?");

  return {
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY,
    mnemonic: MNEMONIC,
  };
}

export default getConfig();
