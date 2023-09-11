import Image from "next/image";
import { VscAccount } from "react-icons/vsc";

type ProfileImageProps = {
  src: string | null;
  className?: string;
};

export const ProfileImage = ({ src, className = "" }: ProfileImageProps) => {
  return (
    <div
      className={`${className} relative h-12 w-12 overflow-hidden rounded-full`}
    >
      {src === null ? (
        <VscAccount className="h-full w-full" />
      ) : (
        <Image
          src={src}
          alt="Image Profile"
          quality={100}
          width={50}
          height={50}
        />
      )}
    </div>
  );
};
