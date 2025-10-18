import { useEffect, useRef, useState } from "react";
import ProfileCard, { type Profile } from "./ProfileCard";

const SAMPLE_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Alex Rivera",
    username: "alexrivera",
    avatar: "AR",
    bio: "Mycology enthusiast and nature explorer. Always discovering new things.",
    mutualFriends: 3,
  },
  {
    id: "2",
    name: "Jordan Chen",
    username: "jordanchen",
    avatar: "JC",
    bio: "Digital artist and creative thinker. Building beautiful things online.",
    mutualFriends: 5,
  },
  {
    id: "3",
    name: "Sam Taylor",
    username: "samtaylor",
    avatar: "ST",
    bio: "Tech lover and lifelong learner. Coffee addict ☕",
    mutualFriends: 2,
  },
  {
    id: "4",
    name: "Morgan Lee",
    username: "morganlee",
    avatar: "ML",
    bio: "Game developer and streamer. Let's build something amazing!",
    mutualFriends: 8,
  },
  {
    id: "5",
    name: "Casey Kim",
    username: "caseykim",
    avatar: "CK",
    bio: "Environmental scientist passionate about sustainability.",
    mutualFriends: 1,
  },
  {
    id: "6",
    name: "Riley Johnson",
    username: "rileyjohnson",
    avatar: "RJ",
    bio: "Musician and producer. Creating vibes daily.",
    mutualFriends: 6,
  },
];

interface FeedProps {
  onAddFriend?: (profileId: string) => void;
}

export default function Feed({ onAddFriend }: FeedProps) {
  const [profiles, setProfiles] = useState<Profile[]>([...SAMPLE_PROFILES]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(SAMPLE_PROFILES.length);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProfiles();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  const loadMoreProfiles = () => {
    setProfiles((prev) => {
      // Simulate loading more profiles by rotating through samples
      const newProfiles = SAMPLE_PROFILES.map((profile, index) => {
        const uniqueId = nextIdRef.current + index;
        return {
          ...profile,
          id: `${uniqueId}`,
          name: `${profile.name} ${Math.floor(uniqueId / SAMPLE_PROFILES.length) + 1}`,
          username: `${profile.username}${uniqueId}`,
        };
      });

      nextIdRef.current += SAMPLE_PROFILES.length;

      // Stop loading after reaching a threshold to prevent infinite growth
      const updatedProfiles = [...prev, ...newProfiles];
      if (updatedProfiles.length > 100) {
        setHasMore(false);
      }

      return updatedProfiles;
    });
  };

  return (
    <div className="pb-24 pt-4 md:pt-6">
      <div className="max-w-2xl mx-auto px-3 md:px-4">
        <div className="space-y-3 md:space-y-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onAddFriend={(id) => {
                onAddFriend?.(id);
              }}
            />
          ))}
        </div>

        {/* Intersection observer target for infinite scroll */}
        <div ref={observerTarget} className="h-10 mt-6 md:mt-8 flex items-center justify-center">
          {hasMore && (
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce delay-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
