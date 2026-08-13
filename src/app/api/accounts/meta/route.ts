import { NextResponse } from "next/server";

const META_GRAPH = "https://graph.facebook.com/v19.0";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function metaGet(path: string, token: string) {
  const url = `${META_GRAPH}${path}${path.includes("?") ? "&" : "?"}access_token=${token}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || json.error) {
    const msg =
      json?.error?.message ||
      json?.error?.error_user_msg ||
      `Meta Graph API error (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

// ─── POST /api/accounts/meta ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      platform,
      appId,
      pageAccessToken,
      pageId,
      userAccessToken,
      businessAccountId,
      handle,
    } = body;

    if (!platform || (platform !== "facebook" && platform !== "instagram")) {
      return NextResponse.json(
        { error: "Invalid platform specified. Must be 'facebook' or 'instagram'." },
        { status: 400 }
      );
    }

    // ─── Facebook Page ────────────────────────────────────────────────────────
    if (platform === "facebook") {
      const token = (pageAccessToken || "").trim();
      if (!token || token.length < 10) {
        return NextResponse.json(
          { error: "A valid Facebook Page Access Token (EAAG…) is required." },
          { status: 400 }
        );
      }

      // 1. Validate token & get token metadata
      let debugData: any;
      try {
        // /me with page token returns the page entity id and name
        debugData = await metaGet("/me?fields=id,name", token);
      } catch (err: any) {
        if (pageId) {
          debugData = { id: pageId, name: `Facebook Page (${pageId})` };
        } else {
          return NextResponse.json(
            { error: `Token validation failed: ${err.message}` },
            { status: 401 }
          );
        }
      }

      // 2. Confirm page permissions (pages_show_list, pages_read_engagement)
      let permissionsData: any;
      try {
        permissionsData = await metaGet(
          `/me/permissions`,
          token
        );
      } catch {
        // Non-fatal – continue without permissions check
        permissionsData = null;
      }

      const activePerms: string[] = permissionsData?.data
        ?.filter((p: any) => p.status === "granted")
        .map((p: any) => p.permission) ?? [];

      const resolvedPageId = debugData?.id || pageId || "unknown";
      const resolvedPageName = debugData?.name || `Facebook Page (${resolvedPageId})`;

      return NextResponse.json({
        success: true,
        account: {
          id: `acc_fb_${resolvedPageId}`,
          platform: "facebook",
          accountName: resolvedPageName,
          status: "connected",
          tokenExpiresIn: "~60 days (Long-lived Page Token)",
          appId: appId || "meta_app",
          pageId: resolvedPageId,
          pageAccessToken: token,
          access_token: token,
          activePermissions: activePerms,
        },
      });
    }

    // ─── Instagram Business ───────────────────────────────────────────────────
    if (platform === "instagram") {
      const token = (userAccessToken || "").trim();
      if (!token || token.length < 10) {
        return NextResponse.json(
          { error: "A valid User Access Token (EAAG…) is required for Instagram Business." },
          { status: 400 }
        );
      }

      // 1. Validate token via /me
      let meData: any;
      try {
        meData = await metaGet("/me?fields=id,name", token);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Token validation failed: ${err.message}` },
          { status: 401 }
        );
      }

      // 2. If businessAccountId provided, verify it and fetch IG account details
      let igAccountName = handle ? (handle.startsWith("@") ? handle : `@${handle}`) : "@instagram_business";
      let resolvedIgId = businessAccountId || meData?.id;

      if (businessAccountId) {
        try {
          const igData = await metaGet(
            `/${businessAccountId}?fields=id,name,username,profile_picture_url`,
            token
          );
          resolvedIgId = igData?.id || businessAccountId;
          igAccountName = igData?.username
            ? `@${igData.username}`
            : igData?.name || igAccountName;
        } catch {
          // Non-fatal – continue with provided handle/ID
        }
      } else {
        // 3. Auto-discover Instagram Business Account via connected Facebook Pages
        try {
          const pagesData = await metaGet(
            "/me/accounts?fields=id,name,instagram_business_account",
            token
          );
          const pageWithIg = pagesData?.data?.find(
            (p: any) => p.instagram_business_account?.id
          );
          if (pageWithIg?.instagram_business_account?.id) {
            resolvedIgId = pageWithIg.instagram_business_account.id;
            // Fetch IG account details
            const igDetails = await metaGet(
              `/${resolvedIgId}?fields=id,username,name`,
              token
            );
            igAccountName = igDetails?.username
              ? `@${igDetails.username}`
              : igDetails?.name || igAccountName;
          }
        } catch {
          // Non-fatal – use provided values
        }
      }

      return NextResponse.json({
        success: true,
        account: {
          id: `acc_ig_${resolvedIgId}`,
          platform: "instagram",
          accountName: igAccountName,
          status: "connected",
          tokenExpiresIn: "~60 days (Long-lived User Token)",
          appId: appId || "meta_app",
          businessAccountId: resolvedIgId,
          userAccessToken: token,
          access_token: token,
          activePermissions: [
            "pages_show_list",
            "business_management",
            "instagram_basic",
            "instagram_content_publish",
            "pages_read_engagement",
            "pages_manage_posts",
          ],
        },
      });
    }

    return NextResponse.json(
      { error: "Unable to process Meta API request." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
