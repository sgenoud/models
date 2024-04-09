import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";

export default (post: CollectionEntry<"blog">, image) => {
  return (
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />

      <div
        style={{
          border: "4px solid #000",
          position: "relative",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1 1 40%",
            flexDirection: "column",
            padding: "24px",
            height: "90%",
            overflowX: "visible",
          }}
        >
          <p
            style={{
              fontSize: 64,
              fontWeight: "bold",
              overflow: "hidden",
            }}
          >
            {post.data.title}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: 28,
            }}
          >
            <span>
              by{" "}
              <span
                style={{
                  color: "transparent",
                }}
              >
                "
              </span>
              <span style={{ overflow: "hidden", fontWeight: "bold" }}>
                {post.data.author}
              </span>
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flex: "1 1 50%",
            padding: "24px",
          }}
        >
          <img
            src={image}
            width="100%"
            height="100%"
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};
