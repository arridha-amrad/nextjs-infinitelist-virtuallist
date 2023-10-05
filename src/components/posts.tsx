"use client";

import { useEffect, useState } from "react";
import PostItem from "./post-item";
import { fetchPosts } from "@/api/fetchPosts";
import { useLastElement } from "@/hooks/useLastElement";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

export default function Posts({ response }: { response: PostResponse }) {
  const [data, setData] = useState(response);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const lastPostRef = useLastElement({
    callback: () => setPage((val) => val + 1),
    data: data.posts,
    loading,
    total: data.total,
  });

  useEffect(() => {
    const skip = page * 10;
    if (page <= 0) return;
    setLoading(true);
    fetchPosts(skip)
      .then((incomingData) => {
        setData((data) => ({
          ...incomingData,
          posts: [...data.posts, ...incomingData.posts],
        }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  const windowRowVirtualizer = useWindowVirtualizer({
    count: data.posts.length,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <section
      style={{
        height: windowRowVirtualizer.getTotalSize(),
        width: "100%",
        position: "relative",
      }}
    >
      {windowRowVirtualizer.getVirtualItems().map((virtualRow) => {
        const post = data.posts[virtualRow.index];
        return (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              data-index={virtualRow.index}
              ref={windowRowVirtualizer.measureElement}
            >
              {virtualRow.index === data.posts.length - 1 ? (
                <>
                  <PostItem post={post} ref={lastPostRef} />
                  {loading && (
                    <div className="py-2 border-y">
                      <p className="text-center">loading...</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <PostItem post={post} />
                  <hr />
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
