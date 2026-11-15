// media 能力包的解析器 —— 不需要浏览器，进 `npm test`
//
// 样本的形状照 2026-11-07 在真实页面上看到的（字段名、单位、混淆键），值做了删减。
// 页面侧的胶水（读 window、点按钮、截帧）只能在浏览器里验，见 docs/MEDIA-PROBE 交接文档。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { num, chaptersFromText, mergeComments, sortStreams, uniqTags } from '../loads/media/lib/util.js';
import * as douyin from '../loads/media/lib/douyin.js';
import * as xhs from '../loads/media/lib/xhs.js';
import * as bili from '../loads/media/lib/bilibili.js';
import * as yt from '../loads/media/lib/youtube.js';
import { collect } from '../loads/media/lib/list.js';

test('num：万、k、逗号、空', () => {
  assert.equal(num('1.2万'), 12000);
  assert.equal(num('3.4w'), 34000);
  assert.equal(num('12,345'), 12345);
  assert.equal(num('1.5M'), 1500000);
  assert.equal(num('870'), 870);
  assert.equal(num(''), null);
  assert.equal(num('赞'), null);
  assert.equal(num(0), 0);
});

test('num：负数和小数不被取整（响度 -15.4 LUFS）', () => {
  assert.equal(num('-15.4'), -15.4);
  assert.equal(num('119.9825'), 119.9825);
});

test('标签去重不分大小写，留先出现的写法', () => {
  assert.deepEqual(uniqTags(['AI教程', 'ai教程', ' GPT6 ', 'gpt6', '', null]), ['AI教程', ' GPT6 ']);
});

test('抖音：同清晰度同编码只留最小的一条，带音频的 h264 mp4 排最前，最多 8 条', () => {
  const s = (name, format, isH265, height, dataSize) => ({ gearName: name, format, isH265, width: height * 16 / 9, height, dataSize, bitRate: 1, playAddr: [{ src: `https://v/${name}` }] });
  const d = douyin.parseAweme({
    awemeId: '1',
    video: {
      duration: 60000,
      bitRateList: [
        s('dash1080', 'dash', 1, 1080, 10), s('h265_1080', 'mp4', 1, 1080, 20), s('big1080', 'mp4', 0, 1080, 90), s('small1080', 'mp4', 0, 1080, 50),
        ...[720, 576, 540, 480, 360, 240, 144].map((h) => s(`h${h}`, 'mp4', 0, h, h)),
      ],
    },
  });
  const v = d.visual.videoStreams;
  assert.equal(v.length, 8);
  assert.equal(v[0].gearName, 'small1080');
  assert.ok(!v.some((x) => x.gearName === 'big1080'));
});

test('描述里的时间轴变章节；零散时间点不算', () => {
  const c = chaptersFromText('简介\n0:00 开场\n1:05 安装\n12:30 - 结尾');
  assert.deepEqual(c.map((x) => [x.startSec, x.title]), [[0, '开场'], [65, '安装'], [750, '结尾']]);
  assert.deepEqual(chaptersFromText('看 3:20 那里'), []);
  assert.deepEqual(chaptersFromText('5:00 a\n1:00 b'), []);
});

const DY_SSR = {
  awemeId: '7688991493951933730',
  desc: '让神GPT6接管即梦，你将得到什么？ GPT6的思考能力… #GPT6 #AI工作流',
  itemTitle: '让神GPT6接管即梦，你将得到什么？',
  createTime: 1790244000,
  authorInfo: { uid: '2478772002760987', secUid: 'MS4wLjABAAAAkp', nickname: '知奥Rowan', followerCount: 2049, totalFavorited: 21466 },
  stats: { commentCount: 81, diggCount: 5192, shareCount: 1256, playCount: 0, collectCount: 4880, recommendCount: 25 },
  textExtra: [{ hashtagName: 'GPT6' }, { hashtagName: 'AI工作流' }],
  videoTag: [{ tagName: '个人管理' }, { tagName: '职场技能' }, { tagName: '办公效率' }],
  suggestWords: [{ words: [{ word: '即梦' }, { word: 'GPT6智能工具推荐' }] }],
  chapterInfo: {
    chapterAbstract: '全片摘要',
    list: [
      { desc: '引言', detail: '', timestamp: 0, url: 'https://p3-pc-sign.douyinpic.com/obj/a' },
      { desc: '即梦CLI安装', detail: '', timestamp: 26000, url: 'https://p9-pc-sign.douyinpic.com/obj/b' },
    ],
  },
  music: { title: '@知奥Rowan创作的原声', author: '知奥Rowan', isOriginal: false, duration: 156, playUrl: { urlList: ['https://sf11/x.mp3'] } },
  video: {
    duration: 156478,
    width: 1920, height: 1080,
    bitRateList: [
      { gearName: 'normal_1080_0', format: 'mp4', isH265: 0, width: 1920, height: 1080, dataSize: 23838331, bitRate: 1218744, playAddr: [{ src: 'https://v26-webf.douyinvod.com/1080' }] },
      { gearName: '540_4_1', format: 'dash', isH265: 1, width: 960, height: 540, dataSize: 2915316, bitRate: 149057, playAddr: [{ src: 'https://v26-webf.douyinvod.com/540dash' }] },
    ],
    bitRateAudioList: [
      { size: 1983761, bitrate: 128000, urlList: [{ src: 'https://v26-webf.douyinvod.com/audio-hi' }] },
      { size: 983761, bitrate: 50295, urlList: [{ src: 'https://v26-webf.douyinvod.com/media-audio-und-mp4a/' }] },
    ],
    bigThumbs: [{ duration: 156.46666, img_num: 78, img_urls: ['https://p26-sign.douyinpic.com/s1', 'https://p26-sign.douyinpic.com/s2'], img_x_len: 5, img_y_len: 5, img_x_size: 240, img_y_size: 136, interval: 2 }],
    originCoverUrlList: ['https://p3-sign.douyinpic.com/cover'],
    meta: { loudness: '-15.4', brightness_mean: '119.9825', vqs_origin: '69.58' },
  },
};

test('抖音 SSR（驼峰）：章节图、最小音频流、雪碧图、类目和搜索词', () => {
  const d = douyin.parseAweme(DY_SSR, { ua: 'UA' });
  assert.equal(d.id, '7688991493951933730');
  assert.equal(d.title, '让神GPT6接管即梦，你将得到什么？');
  assert.equal(d.durationSec, 156.48);
  assert.equal(d.stats.view, null, '抖音网页版的 playCount=0 不能当真');
  assert.equal(d.stats.collect, 4880);
  assert.equal(d.author.followers, 2049);
  assert.equal(d.author.url, 'https://www.douyin.com/user/MS4wLjABAAAAkp');
  assert.deepEqual(d.visual.chapters.map((c) => [c.title, c.startSec, !!c.thumbUrl]), [['引言', 0, true], ['即梦CLI安装', 26, true]]);
  assert.equal(d.transcript.audioStream.sizeBytes, 983761, '取最小的音频流给转写');
  assert.match(d.transcript.audioStream.url, /media-audio-und-mp4a/);
  assert.equal(d.visual.storyboards[0].intervalSec, 2);
  assert.equal(d.visual.storyboards[0].urls.length, 2);
  assert.equal(d.visual.videoStreams[0].height, 1080);
  assert.equal(d.visual.videoStreams.find((s) => s.format === 'dash').hasAudio, false);
  assert.deepEqual(d.category, ['个人管理', '职场技能', '办公效率']);
  assert.deepEqual(d.searchWords, ['即梦', 'GPT6智能工具推荐']);
  assert.ok(d.tags.includes('GPT6') && d.tags.includes('AI工作流'));
  assert.equal(d.intel.chapterAbstract, '全片摘要');
  assert.equal(d.intel.loudnessLufs, -15.4);
  assert.equal(d.requestHeaders.Referer, 'https://www.douyin.com/');
});

test('抖音接口（下划线）：aweme_detail 一样解析', () => {
  const d = douyin.parseAweme({
    aweme_id: '1', desc: '标题 #话题', create_time: 1, author: { uid: '9', sec_uid: 'S', nickname: 'n', follower_count: 10 },
    statistics: { digg_count: 5, comment_count: 2, collect_count: 3, share_count: 1, play_count: 0 },
    video: {
      duration: 60000,
      bit_rate: [{ gear_name: 'normal_720_0', format: 'mp4', is_h265: 0, play_addr: { url_list: ['https://v.douyinvod.com/720'], width: 1280, height: 720, data_size: 100 }, bit_rate: 900 }],
      bit_rate_audio: [{ audio_meta: { url_list: { main_url: 'https://v.douyinvod.com/a' }, size: 50, bitrate: 48000 } }],
      big_thumbs: [],
    },
    chapter_info: { list: [{ desc: 'A', timestamp: 1000 }] },
  });
  assert.equal(d.durationSec, 60);
  assert.equal(d.visual.videoStreams[0].url, 'https://v.douyinvod.com/720');
  assert.equal(d.visual.videoStreams[0].height, 720);
  assert.equal(d.transcript.audioStream.url, 'https://v.douyinvod.com/a');
  assert.equal(d.visual.chapters[0].startSec, 1);
  assert.equal(d.author.followers, 10);
  assert.deepEqual(d.tags, ['话题']);
});

test('抖音：suggest_words 是对象、列表字段是别的形状时不崩', () => {
  const d = douyin.parseAweme({
    aweme_id: '1', desc: 'x',
    suggest_words: { suggest_words: [{ words: [{ word: '搜这个' }] }] },
    text_extra: null, video_tag: {}, images: 3,
    chapter_info: { list: 'oops' },
    video: { duration: 1000, bit_rate: 123, bit_rate_audio: {}, big_thumbs: '' },
  });
  assert.deepEqual(d.searchWords, ['搜这个']);
  assert.deepEqual(d.visual.videoStreams, []);
  assert.deepEqual(d.visual.chapters, []);
});

test('YouTube：粉丝数从 ytInitialData 取，不依赖页面渲染', () => {
  const page = { currentVideoEndpoint: { watchEndpoint: { videoId: 'v1' } }, contents: { x: [{ videoOwnerRenderer: { subscriberCountText: { simpleText: '86.8K subscribers' } } }] } };
  assert.equal(yt.dataFollowers(page, 'v1'), 86800);
  assert.equal(yt.dataFollowers(page, 'other'), null);
});

test('抖音地址里的作品 id', () => {
  assert.equal(douyin.targetId('https://www.douyin.com/jingxuan?modal_id=7698741380596358074'), '7698741380596358074');
  assert.equal(douyin.targetId('https://www.douyin.com/video/7688991493951933730'), '7688991493951933730');
  assert.equal(douyin.targetId('https://www.douyin.com/'), '');
});

test('抖音评论', () => {
  const [c] = douyin.parseComments({ comments: [{ cid: '77', text: 'GPT6是什么 哪里下载', digg_count: 3, reply_comment_total: 1, ip_label: '江西', create_time: 1793285808, user: { nickname: '我霸吧', uid: '2' }, is_author_digged: true, stick_position: 0 }] });
  assert.deepEqual([c.id, c.text, c.likes, c.repliesCount, c.location, c.authorLiked], ['77', 'GPT6是什么 哪里下载', 3, 1, '江西', true]);
});

test('小红书：流在混淆键 EF4 下，h264 为空也拿得到；字符串计数转数字', () => {
  const entry = {
    note: {
      noteId: '6aedbd0c0000000009012630', type: 'video', title: '特朗普为啥输这么惨？',
      desc: '@知识薯 #特朗普[话题]# #经济[话题]#', time: 1793965324000, ipLocation: '浙江', xsecToken: 'TOK',
      interactInfo: { likedCount: '870', collectedCount: '178', commentCount: '23', shareCount: '96' },
      user: { userId: '5e7d', nickname: '直男财经' },
      tagList: [{ name: '特朗普' }, { name: '经济' }],
      imageList: [{ urlDefault: 'http://sns-webpic-qc.xhscdn.com/cover' }],
      video: {
        capa: { duration: 435 },
        media: {
          video: { duration: 436 },
          stream: {
            h264: [], h265: [],
            EF4: [
              { masterUrl: 'http://sns-video-zl.xhscdn.com/stream/1/110/258/a_258.mp4', width: 720, height: 1280, size: 85204937, audioBitrate: 56002, avgBitrate: 1558237, duration: 435670, videoCodec: 'EF4', backupUrls: ['http://b'] },
              { masterUrl: 'http://sns-video-zl.xhscdn.com/stream/1/110/268/a_268.mp4', width: 1080, height: 1920, size: 171588455, audioBitrate: 56002, duration: 435670, videoCodec: 'EF4', backupUrls: [] },
            ],
            EF6: [],
          },
        },
      },
    },
  };
  const d = xhs.parseNote(entry, { ua: 'UA' });
  assert.equal(d.id, '6aedbd0c0000000009012630');
  assert.equal(d.durationSec, 435);
  assert.equal(d.createTime, 1793965324);
  assert.deepEqual([d.stats.like, d.stats.collect, d.stats.comment, d.stats.share], [870, 178, 23, 96]);
  assert.equal(d.visual.videoStreams.length, 2);
  assert.equal(d.visual.videoStreams[0].width, 1080, '清晰的排前面');
  assert.ok(d.visual.videoStreams.every((s) => s.hasAudio));
  assert.equal(d.transcript.audioStream, null, '小红书没有单独的音频流');
  assert.equal(d.desc, '@知识薯 #特朗普# #经济#');
  assert.ok(d.tags.includes('特朗普'));
  assert.match(d.url, /xsec_token=TOK/);
  assert.equal(d.intel.ipLocation, '浙江');
});

test('小红书：Vue ref 拆包、评论里作者回复', () => {
  assert.deepEqual(xhs.unref({ __v_isRef: true, _rawValue: { a: 1 } }), { a: 1 });
  const c = xhs.parseComment({ id: 'c1', content: '求链接', likeCount: '10', subCommentCount: '1', ipLocation: '重庆', createTime: 1794015892000, userInfo: { nickname: '美嘉谷' }, subComments: [{ content: '已私', likeCount: '0', userInfo: { nickname: '直男财经' }, showTags: ['is_author'] }] });
  assert.deepEqual([c.likes, c.repliesCount, c.createTime, c.authorReplied], [10, 1, 1794015892, true]);
});

test('B 站：dash 音视频流、字幕、评论', () => {
  const { streams, audios } = bili.parsePlayurl({
    dash: {
      video: [{ id: 80, width: 1920, height: 1080, codecs: 'avc1.640032', bandwidth: 800000, baseUrl: 'https://upos-sz-mirrorcosov.bilivideo.com/upgcxcode/38/58/43291315838/43291315838-1-30080.m4s', backupUrl: ['https://b'] },
        { id: 32, width: 852, height: 480, codecs: 'hev1.1.6.L120.90', bandwidth: 220679, baseUrl: 'https://x/43291315838-1-30033.m4s' }],
      audio: [{ id: 30280, bandwidth: 166746, codecs: 'mp4a.40.2', baseUrl: 'https://a/hi.m4s' }, { id: 30216, bandwidth: 66164, codecs: 'mp4a.40.2', baseUrl: 'https://a/lo.m4s' }],
    },
  }, 843);
  assert.equal(streams[0].quality, '1080p');
  assert.equal(streams[0].codec, 'h264');
  assert.equal(streams[1].codec, 'h265');
  assert.equal(streams[0].hasAudio, false);
  assert.equal(audios[0].url, 'https://a/lo.m4s', '最省流量的音频排第一');
  assert.equal(audios[0].sizeBytes, Math.round(66164 / 8 * 843));
  assert.deepEqual(bili.parseSubtitle({ body: [{ from: 0.5, to: 2, content: '大家好' }] }), [{ start: 0.5, end: 2, text: '大家好' }]);
  const r = bili.parseReply({ rpid: 1, content: { message: '讲得好' }, like: 30, rcount: 2, member: { uname: 'u', mid: 3 }, reply_control: { location: 'IP属地：广东' }, ctime: 5, up_action: { like: true, reply: false } });
  assert.deepEqual([r.id, r.text, r.likes, r.location, r.authorLiked], ['1', '讲得好', 30, '广东', true]);
  assert.equal(bili.targetId('https://www.bilibili.com/video/BV1t84g62Ejw/?p=2'), 'BV1t84g62Ejw');
});

test('YouTube：json3 / srv3 / 旧 XML 字幕都能读', () => {
  const j = yt.parseTimedtext(JSON.stringify({ events: [{ tStartMs: 0, dDurationMs: 1500, segs: [{ utf8: '大家好' }, { utf8: '，我是' }] }, { tStartMs: 1600, segs: [{ utf8: '\n' }] }, { tStartMs: 2000, dDurationMs: 1000, segs: [{ utf8: '小林' }] }] }));
  assert.deepEqual(j, [{ start: 0, end: 1.5, text: '大家好，我是' }, { start: 2, end: 3, text: '小林' }]);
  assert.deepEqual(yt.parseTimedtext('<timedtext><body><p t="1000" d="500">a &amp; b</p></body></timedtext>'), [{ start: 1, end: 1.5, text: 'a & b' }]);
  assert.deepEqual(yt.parseTimedtext('<transcript><text start="1.5" dur="2">hi</text></transcript>'), [{ start: 1.5, end: 3.5, text: 'hi' }]);
});

test('YouTube：雪碧图 spec 取最清楚的一级，拼出每张图的地址', () => {
  const spec = 'https://i.ytimg.com/sb/EzuIDDnpyy8/storyboard3_L$L/$N.jpg?sqp=abc|48#27#100#10#10#0#default#rs$A|80#45#96#10#10#5000#M$M#rs$B|160#90#96#5#5#5000#M$M#rs$C';
  const [s] = yt.parseStoryboard(spec, 477);
  assert.equal(s.frameWidth, 160);
  assert.equal(s.intervalSec, 5);
  assert.equal(s.urls.length, 4);
  assert.equal(s.urls[0], 'https://i.ytimg.com/sb/EzuIDDnpyy8/storyboard3_L2/M0.jpg?sqp=abc&sigh=rs$C');
  assert.equal(s.urls[3], 'https://i.ytimg.com/sb/EzuIDDnpyy8/storyboard3_L2/M3.jpg?sqp=abc&sigh=rs$C');
});

test('YouTube：player response → 统一结构；流标成绑 IP、没有地址', () => {
  const d = yt.parsePlayer({
    videoDetails: { videoId: 'EzuIDDnpyy8', title: 'DeepSeek 发布 Super-Agent', lengthSeconds: '477', channelId: 'UC1', author: 'AI学长小林', viewCount: '12345', keywords: ['DeepSeek'], shortDescription: '0:00 开场\n1:30 Router\n#AI' },
    microformat: { playerMicroformatRenderer: { publishDate: '2026-11-01T08:00:00-07:00', category: 'Science & Technology', likeCount: '321' } },
    captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ baseUrl: 'https://www.youtube.com/api/timedtext?v=EzuIDDnpyy8&lang=zh-Hans', languageCode: 'zh-Hans', name: { simpleText: '中文' } }] } },
    streamingData: { adaptiveFormats: [{ itag: 137, mimeType: 'video/mp4; codecs="avc1.640028"', qualityLabel: '1080p', width: 1920, height: 1080 }] },
  }, { href: 'https://www.youtube.com/watch?v=EzuIDDnpyy8' });
  assert.equal(d.durationSec, 477);
  assert.equal(d.stats.view, 12345);
  assert.equal(d.stats.like, 321);
  assert.deepEqual(d.visual.chapters.map((c) => c.startSec), [0, 90]);
  assert.equal(d.visual.videoStreams[0].ipBound, true);
  assert.equal(d.visual.videoStreams[0].url, null);
  assert.equal(d.transcript.subtitleTracks[0].lang, 'zh-Hans');
  assert.ok(d.tags.includes('DeepSeek') && d.tags.includes('AI'));
  assert.equal(d.visual.coverUrl, 'https://i.ytimg.com/vi/EzuIDDnpyy8/maxresdefault.jpg');
});

test('YouTube：新旧两种评论结构', () => {
  const list = yt.parseNextComments({
    frameworkUpdates: { entityBatchUpdate: { mutations: [{ payload: { commentEntityPayload: { properties: { commentId: 'a', content: { content: '讲得清楚' }, publishedTime: '2 天前' }, author: { displayName: '@x', isCreator: false }, toolbar: { likeCountNotliked: '1.2K', replyCount: '3' } } } }] } },
    onResponseReceivedEndpoints: [{ x: { commentThreadRenderer: { comment: { commentRenderer: { commentId: 'b', contentText: { runs: [{ text: '老版' }] }, authorText: { simpleText: '@y' }, voteCount: { simpleText: '5' } } } } } }],
  });
  assert.deepEqual(list.map((c) => [c.id, c.text, c.likes]), [['a', '讲得清楚', 1200], ['b', '老版', 5]]);
});

test('YouTube：评论翻页 token 和总数；回复区的 continuation 不算翻页', () => {
  const page = { currentVideoEndpoint: { watchEndpoint: { videoId: 'v1' } }, contents: { a: [{ itemSectionRenderer: { sectionIdentifier: 'comment-item-section', contents: [{ continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'T1' } } } }] } }] } };
  assert.equal(yt.firstCommentToken(page, 'v1'), 'T1');
  assert.equal(yt.firstCommentToken(page, 'other'), null, '站内切换后 ytInitialData 还是上一个视频');
  const replyCont = { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'REPLY' } } } };
  const json = { onResponseReceivedEndpoints: [
    { reloadContinuationItemsCommand: { continuationItems: [{ commentsHeaderRenderer: { countText: { runs: [{ text: '1,234' }, { text: ' Comments' }] } } }] } },
    { reloadContinuationItemsCommand: { continuationItems: [{ commentThreadRenderer: { replies: { commentRepliesRenderer: { contents: [replyCont] } } } }, { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'T2' } } } }] } },
  ] };
  assert.equal(yt.nextCommentToken(json), 'T2');
  assert.equal(yt.commentTotal(json), 1234);
  assert.equal(yt.nextCommentToken({ onResponseReceivedEndpoints: [{ appendContinuationItemsAction: { continuationItems: [{ commentThreadRenderer: { replies: { commentRepliesRenderer: { contents: [replyCont] } } } }] } }] }), null);
});

test('列表页：认出各平台「长得像一条作品」的对象', () => {
  const dy = collect('douyin', [{ aweme_list: [{ aweme_id: '1', desc: '甲 #t', statistics: { digg_count: 100, comment_count: 2 }, video: { duration: 30000 }, author: { nickname: 'A' } }, { aweme_id: '2', desc: '乙', statistics: { digg_count: 5 }, video: { duration: 12 } }] }]);
  assert.deepEqual(dy.map((x) => [x.id, x.stats.like, x.durationSec]), [['1', 100, 30], ['2', 5, 12]]);
  const xh = collect('xiaohongshu', [{ data: { items: [{ id: '6aedbd0c0000000009012630', xsec_token: 'T', note_card: { display_title: '标题', type: 'video', interact_info: { liked_count: '1.1万' }, user: { nickname: 'B' } } }] } }]);
  assert.equal(xh[0].stats.like, 11000);
  assert.match(xh[0].url, /xsec_token=T/);
  const bl = collect('bilibili', [{ data: { result: [{ bvid: 'BV1t84g62Ejw', title: '<em class="keyword">枪</em>战', play: 809797, like: 38083, duration: '14:03', author: 'C' }] } }]);
  assert.deepEqual([bl[0].title, bl[0].stats.view, bl[0].durationSec], ['枪战', 809797, 843]);
});

test('评论合并：按 id 去重、按赞排；视频流按清晰度排', () => {
  const m = mergeComments([[{ id: '1', text: 'a', likes: 1 }, { id: '2', text: 'b', likes: 9 }], [{ id: '1', text: 'a', likes: 3 }]]);
  assert.deepEqual(m.map((c) => [c.id, c.likes]), [['2', 9], ['1', 3]]);
  const s = sortStreams([{ url: 'a', width: 1280, height: 720, sizeBytes: 9 }, { url: 'b', width: 1920, height: 1080, sizeBytes: 5 }, { url: 'a', width: 1280, height: 720 }]);
  assert.deepEqual(s.map((x) => x.url), ['b', 'a']);
});
