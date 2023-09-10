import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeartFilled, VscHeart } from "react-icons/vsc";
import IconHoverEffect from "./IconHoverEffect";
import { api } from "~/utils/api";
import LoadingSpinner from "./LoadingSpinner";
type Tweet = {
  id: string;
  createdAt: Date;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};
type InfiniteTweetListProps = {
  isLoading: boolean;
  hasMore: boolean | undefined;
  isError: boolean;
  fetchNewTweets: () => Promise<unknown>;
  tweets: Tweet[] | undefined;
};

export const InfiniteTweetList = ({
  tweets,
  isError,
  isLoading,
  hasMore = false,
  fetchNewTweets,
}: InfiniteTweetListProps) => {
  if (isError) return <h1>Error...</h1>;
  if (isLoading)
    return (
      <h1>
        <LoadingSpinner />
      </h1>
    );
  if (tweets == null || tweets.length === 0)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">
        You have no tweets bro...
      </h2>
    );

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {tweets.map((tweet, index) => {
          return <TweetCard {...tweet} key={index} />;
        })}
      </InfiniteScroll>
    </ul>
  );
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

const TweetCard = ({
  user,
  likedByMe,
  likeCount,
  content,
  createdAt,
  id,
}: Tweet) => {
  const trpcUtils = api.useContext();
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (!oldData) return;
        const countModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map((tweet) => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                }
                return tweet;
              }),
            };
          }),
        };
      };
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);

      trpcUtils.tweet.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData,
      );

      trpcUtils.tweet.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData,
      );
    },
  });

  const handleToggleLike = () => {
    toggleLike.mutate({ id });
  };

  return (
    <>
      <li className="flex gap-4 border-b p-4">
        <Link href={`/profiles/${user.id}`}>
          <ProfileImage src={user.image} />
        </Link>
        <div className="ml-2 flex flex-grow flex-col">
          <div className="flex gap-1">
            <Link
              href={`/profiles/${user.id}`}
              className="font-bold outline-none hover:underline focus-visible:underline"
            >
              {user.name}
            </Link>
            <span className="text-gray-400">-</span>
            <span className="text-gray-400">
              {dateTimeFormatter.format(createdAt)}
            </span>
          </div>
          <div className="whitespace-pre-wrap">{content}</div>
          <HeartButton
            likedByMe={likedByMe}
            likeCount={likeCount}
            isLoading={toggleLike.isLoading}
            onClick={handleToggleLike}
          />
        </div>
      </li>
    </>
  );
};

type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

const HeartButton = ({
  likedByMe,
  likeCount,
  isLoading,
  onClick,
}: HeartButtonProps) => {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="flex-grow-4 mb-1 mt-1 flex items-center gap-3 self-start bg-slate-500 text-gray-500 ">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200${
            likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
};
