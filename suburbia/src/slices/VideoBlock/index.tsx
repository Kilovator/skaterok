import { Bounded } from "@/components/Bounded";
import { LazyYouTubePlayer } from "./LazyYouTubePlayer";
import clsx from "clsx";
import Image from "next/image";
import { videoBlockData } from "@/data/homepage";

const MASK_CLASSES =
  "[mask-image:url(/video-mask.png)] [mask-mode:alpha] [mask-position:center_center] [mask-repeat:no-repeat] [mask-size:100%_auto]";

const VideoBlock = (): JSX.Element => {
  return (
    <Bounded className="bg-texture bg-zinc-900">
      <h2 className="sr-only">Video Reel</h2>
      <div className="relative aspect-video">
        {/* Masks */}
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-brand-amethyst absolute inset-0 ~translate-x-2/3 ~translate-y-2/3"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/3 ~translate-y-1/2"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/2 ~-translate-y-1/3"
          )}
        />
        {/* Video */}
        <div className={clsx(MASK_CLASSES, "relative h-full")}>
          {videoBlockData.youtubeVideoId ? (
            <LazyYouTubePlayer youTubeID={videoBlockData.youtubeVideoId} />
          ) : null}
          <Image
            src="/image-texture.png"
            alt=""
            fill
            className="pointer-events-none object-cover opacity-50"
          />
        </div>
      </div>
    </Bounded>
  );
};

export default VideoBlock;
