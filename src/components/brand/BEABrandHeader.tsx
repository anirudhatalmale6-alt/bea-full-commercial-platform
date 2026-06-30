import { beaBrand } from "@/config/brand";

export default function BEABrandHeader() {
  return (
    <a className="beaLogo" href="/" aria-label={`${beaBrand.displayName} home`}>
      <span className="beaLogoMark">{beaBrand.shortName}</span>
      <span>{beaBrand.displayName}</span>
    </a>
  );
}
