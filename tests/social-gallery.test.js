"use strict";

const assert = require("node:assert/strict");
const SOCIAL = require("../api/_lib/social.js");

process.env.FB_PAGE_ID = "page-1";
process.env.IG_USER_ID = "ig-1";
process.env.FB_PAGE_TOKEN = "test-token";

const originalFetch = global.fetch;
const vehicle = {
  id: "2017-volkswagen-golf-iftqk",
  year: 2017,
  make: "Volkswagen",
  model: "Golf",
  trim: "Trendline",
  images: Array.from({ length: 12 }, function (_, i) {
    return "images/vehicles/golf/photo-" + (i + 1) + ".jpg";
  })
};

function response(body, ok) {
  return {
    ok: ok !== false,
    status: ok === false ? 400 : 200,
    json: async function () { return body || {}; }
  };
}

async function testFacebookGallery() {
  const photoBodies = [];
  let feedBody = null;
  global.fetch = async function (url, options) {
    if (options && options.method === "HEAD") return response();
    if (/\/page-1\/photos$/.test(url)) {
      const params = new URLSearchParams(options.body);
      photoBodies.push(params);
      return response({ id: "fb-photo-" + params.get("url").match(/photo-(\d+)/)[1] });
    }
    if (/\/page-1\/feed$/.test(url)) {
      feedBody = new URLSearchParams(options.body);
      return response({ id: "page-1_post-1" });
    }
    throw new Error("Unexpected Facebook request: " + url);
  };

  const out = await SOCIAL.postToFacebook(vehicle, "Custom caption");
  assert.equal(out.id, "page-1_post-1");
  assert.equal(out.mediaCount, 10);
  assert.equal(out.mode, "gallery");
  assert.equal(photoBodies.length, 10, "Facebook must upload at most ten photos");
  assert(photoBodies.every(p => p.get("published") === "false"));
  assert.equal(feedBody.get("link"), null, "a gallery post must not create a competing link attachment");
  assert(feedBody.get("message").includes(SOCIAL.vehicleUrl(vehicle)), "the clickable vehicle URL must remain in the caption");
  for (let i = 0; i < 10; i += 1) {
    assert.deepEqual(JSON.parse(feedBody.get("attached_media[" + i + "]")), { media_fbid: "fb-photo-" + (i + 1) });
  }
}

async function testFacebookLinkFallback() {
  let feedBody = null;
  global.fetch = async function (url, options) {
    if (/\/page-1\/feed$/.test(url)) {
      feedBody = new URLSearchParams(options.body);
      return response({ id: "page-1_link-post" });
    }
    throw new Error("Unexpected fallback request: " + url);
  };
  const out = await SOCIAL.postToFacebook(Object.assign({}, vehicle, { images: [] }), "No-photo caption");
  assert.equal(out.mediaCount, 0);
  assert.equal(out.mode, "link");
  assert.equal(feedBody.get("link"), SOCIAL.vehicleUrl(vehicle));
}

async function testFacebookKeepsChosenCover() {
  let feedBody = null;
  global.fetch = async function (url, options) {
    if (options && options.method === "HEAD") return response();
    if (/\/page-1\/photos$/.test(url)) {
      const params = new URLSearchParams(options.body);
      const number = Number(params.get("url").match(/photo-(\d+)/)[1]);
      return number === 1 ? response({ error: { message: "cover failed" } }, false) : response({ id: "fb-photo-" + number });
    }
    if (/\/page-1\/feed$/.test(url)) {
      feedBody = new URLSearchParams(options.body);
      return response({ id: "page-1_cover-fallback" });
    }
    throw new Error("Unexpected cover fallback request: " + url);
  };
  const out = await SOCIAL.postToFacebook(vehicle, "Cover test");
  assert.equal(out.mode, "link");
  assert.equal(out.mediaCount, 0);
  assert.equal(feedBody.get("link"), SOCIAL.vehicleUrl(vehicle));
  assert.equal(feedBody.get("attached_media[0]"), null, "photo two must not silently become the cover");
}

async function testInstagramCarousel() {
  const childBodies = [];
  let carouselBody = null;
  let publishBody = null;
  global.fetch = async function (url, options) {
    if (options && options.method === "HEAD") return response();
    if (url.includes("/ig-1/media_publish")) {
      publishBody = new URLSearchParams(options.body);
      return response({ id: "ig-post-1" });
    }
    if (url.includes("?fields=status_code")) return response({ status_code: "FINISHED" });
    if (/\/ig-1\/media$/.test(url)) {
      const params = new URLSearchParams(options.body);
      if (params.get("media_type") === "CAROUSEL") {
        carouselBody = params;
        return response({ id: "ig-carousel-1" });
      }
      childBodies.push(params);
      return response({ id: "ig-child-" + params.get("image_url").match(/photo-(\d+)/)[1] });
    }
    throw new Error("Unexpected Instagram request: " + url);
  };

  const out = await SOCIAL.postToInstagram(vehicle, "Instagram caption");
  assert.equal(out.id, "ig-post-1");
  assert.equal(out.mediaCount, 10);
  assert.equal(out.mode, "carousel");
  assert.equal(childBodies.length, 10, "Instagram must create at most ten carousel children");
  assert(childBodies.every(p => p.get("is_carousel_item") === "true"));
  assert.equal(carouselBody.get("caption"), "Instagram caption");
  assert.equal(carouselBody.get("children"), Array.from({ length: 10 }, (_, i) => "ig-child-" + (i + 1)).join(","));
  assert.equal(publishBody.get("creation_id"), "ig-carousel-1");
}

async function testInstagramSinglePhoto() {
  let mediaBody = null;
  global.fetch = async function (url, options) {
    if (options && options.method === "HEAD") return response();
    if (url.includes("/ig-1/media_publish")) return response({ id: "ig-single-post" });
    if (url.includes("?fields=status_code")) return response({ status_code: "FINISHED" });
    if (/\/ig-1\/media$/.test(url)) {
      mediaBody = new URLSearchParams(options.body);
      return response({ id: "ig-single-container" });
    }
    throw new Error("Unexpected single-image request: " + url);
  };

  const one = Object.assign({}, vehicle, { images: vehicle.images.slice(0, 1) });
  const out = await SOCIAL.postToInstagram(one, "One photo");
  assert.equal(out.mediaCount, 1);
  assert.equal(out.mode, "single");
  assert.equal(mediaBody.get("media_type"), null);
  assert.equal(mediaBody.get("is_carousel_item"), null);
}

async function testInstagramCarouselCreationFallback() {
  let singleBody = null;
  let publishCount = 0;
  global.fetch = async function (url, options) {
    if (options && options.method === "HEAD") return response();
    if (url.includes("/ig-1/media_publish")) {
      publishCount += 1;
      return response({ id: "ig-fallback-post" });
    }
    if (url.includes("?fields=status_code")) return response({ status_code: "FINISHED" });
    if (/\/ig-1\/media$/.test(url)) {
      const params = new URLSearchParams(options.body);
      if (params.get("is_carousel_item") === "true") {
        const number = Number(params.get("image_url").match(/photo-(\d+)/)[1]);
        return number === 1
          ? response({ error: { message: "carousel cover rejected" } }, false)
          : response({ id: "unused-child-" + number });
      }
      singleBody = params;
      return response({ id: "ig-fallback-container" });
    }
    throw new Error("Unexpected carousel fallback request: " + url);
  };

  const out = await SOCIAL.postToInstagram(vehicle, "Fallback caption");
  assert.equal(out.id, "ig-fallback-post");
  assert.equal(out.mode, "single");
  assert.equal(out.mediaCount, 1);
  assert.equal(publishCount, 1, "fallback must create exactly one visible post");
  assert.equal(singleBody.get("image_url"), SOCIAL.firstImage(vehicle));
  assert.equal(singleBody.get("is_carousel_item"), null);
}

async function main() {
  assert.equal(SOCIAL.MAX_GALLERY_IMAGES, 10);
  assert.equal(SOCIAL.imageUrls(vehicle).length, 10);
  assert.equal(SOCIAL.firstImage(vehicle), SOCIAL.imageUrls(vehicle)[0]);
  await testFacebookGallery();
  await testFacebookLinkFallback();
  await testFacebookKeepsChosenCover();
  await testInstagramCarousel();
  await testInstagramSinglePhoto();
  await testInstagramCarouselCreationFallback();
  console.log("Social gallery tests passed.");
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
}).finally(function () {
  global.fetch = originalFetch;
});
