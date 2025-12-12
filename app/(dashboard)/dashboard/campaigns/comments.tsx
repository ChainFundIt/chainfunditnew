import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, User, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import EmptyCampaign from "./emptyCampaign";

interface Comment {
  id: string;
  campaignId: string;
  content: string;
  createdAt: string;
  userId: string;
  fullName: string;
  userAvatar: string;
  campaignTitle: string;
}

type Props = {
  campaigns: any[];
};

const Comments = ({ campaigns }: Props) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments from all user campaigns
  const fetchAllComments = async () => {
    if (!user?.id || campaigns.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch comments for each campaign
      const commentPromises = campaigns.map(async (campaign) => {
        try {
          const response = await fetch(
            `/api/campaigns/${campaign.id}/comments`
          );
          const data = await response.json();

          if (data.success) {
            return data.data.map((comment: any) => ({
              ...comment,
              campaignTitle: campaign.title,
            }));
          }
          return [];
        } catch (error) {
          console.error(
            `Error fetching comments for campaign ${campaign.id}:`,
            error
          );
          return [];
        }
      });

      const allComments = await Promise.all(commentPromises);
      const flattenedComments = allComments.flat();

      // Sort by creation date (newest first)
      flattenedComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setComments(flattenedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, [user?.id, campaigns]);

  // Component to render user avatar for comments
  const CommentAvatar = ({
    userName,
    userAvatar,
  }: {
    userName: string;
    userAvatar?: string;
  }) => {
    if (userAvatar) {
      return (
        <Image
          src={userAvatar}
          alt={userName}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-10 h-10 bg-[#E5ECDE] rounded-full flex items-center justify-center">
        <User className="h-5 w-5 text-[#104901]" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="2xl:container 2xl:mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#104901]" />
          <h3 className="text-2xl font-semibold text-[#104901]">Comments</h3>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="2xl:container 2xl:mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#104901]" />
          <h3 className="text-2xl font-semibold text-[#104901]">Comments</h3>
        </div>
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchAllComments} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="2xl:container 2xl:mx-auto space-y-6 font-jakarta w-full">
      {comments.length !== 0 && (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#104901]" />
          <h3 className="text-2xl font-semibold text-[#104901]">Comments</h3>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <EmptyCampaign
            Icon={MessageSquare}
            title="No Comments Yet"
            subtitle="Comments from your campaigns will appear here."
          />
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-[#D9D9D9] rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <CommentAvatar
                  userName={comment.fullName}
                  userAvatar={comment.userAvatar}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-[#104901]">
                      {comment.fullName}
                    </span>
                    <span className="text-sm text-[#757575] flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#104901] mb-3 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#757575]">
                    <span>on</span>
                    <Link
                      href={`/campaign/${comment.campaignId}`}
                      className="text-[#104901] hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {comment.campaignTitle}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
