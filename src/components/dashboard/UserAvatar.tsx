import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UserAvatar({ name, image, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
