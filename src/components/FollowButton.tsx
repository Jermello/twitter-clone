import { useSession } from "next-auth/react";
import React from "react";
import { Button } from "./Button";
type FollowButtonProps = {
  userId: string;
  isFollowing: boolean;
  onClick: () => void;
  isLoading: boolean;
};

const FollowButton = ({
  userId,
  isFollowing,
  onClick,
  isLoading,
}: FollowButtonProps) => {
  const session = useSession();
  if (session.status !== "authenticated" || session.data.user.id === userId)
    return null;
  return (
    <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;
