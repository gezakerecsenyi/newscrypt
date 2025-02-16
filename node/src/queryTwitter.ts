import {debuggerLog} from "./config";

export type DateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
export enum LangCode {
    ab = 'ab',
    aa = 'aa',
    af = 'af',
    ak = 'ak',
    sq = 'sq',
    am = 'am',
    ar = 'ar',
    an = 'an',
    hy = 'hy',
    as = 'as',
    av = 'av',
    ae = 'ae',
    ay = 'ay',
    az = 'az',
    bm = 'bm',
    ba = 'ba',
    eu = 'eu',
    be = 'be',
    bn = 'bn',
    bi = 'bi',
    bs = 'bs',
    br = 'br',
    bg = 'bg',
    my = 'my',
    ca = 'ca',
    ch = 'ch',
    ce = 'ce',
    ny = 'ny',
    zh = 'zh',
    cu = 'cu',
    cv = 'cv',
    kw = 'kw',
    co = 'co',
    cr = 'cr',
    hr = 'hr',
    cs = 'cs',
    da = 'da',
    dv = 'dv',
    nl = 'nl',
    dz = 'dz',
    en = 'en',
    eo = 'eo',
    et = 'et',
    ee = 'ee',
    fo = 'fo',
    fj = 'fj',
    fi = 'fi',
    fr = 'fr',
    fy = 'fy',
    ff = 'ff',
    gd = 'gd',
    gl = 'gl',
    lg = 'lg',
    ka = 'ka',
    de = 'de',
    el = 'el',
    kl = 'kl',
    gn = 'gn',
    gu = 'gu',
    ht = 'ht',
    ha = 'ha',
    he = 'he',
    hz = 'hz',
    hi = 'hi',
    ho = 'ho',
    hu = 'hu',
    is = 'is',
    io = 'io',
    ig = 'ig',
    id = 'id',
    ia = 'ia',
    ie = 'ie',
    iu = 'iu',
    ik = 'ik',
    ga = 'ga',
    it = 'it',
    ja = 'ja',
    jv = 'jv',
    kn = 'kn',
    kr = 'kr',
    ks = 'ks',
    kk = 'kk',
    km = 'km',
    ki = 'ki',
    rw = 'rw',
    ky = 'ky',
    kv = 'kv',
    kg = 'kg',
    ko = 'ko',
    kj = 'kj',
    ku = 'ku',
    lo = 'lo',
    la = 'la',
    lv = 'lv',
    li = 'li',
    ln = 'ln',
    lt = 'lt',
    lu = 'lu',
    lb = 'lb',
    mk = 'mk',
    mg = 'mg',
    ms = 'ms',
    ml = 'ml',
    mt = 'mt',
    gv = 'gv',
    mi = 'mi',
    mr = 'mr',
    mh = 'mh',
    mn = 'mn',
    na = 'na',
    nv = 'nv',
    nd = 'nd',
    nr = 'nr',
    ng = 'ng',
    ne = 'ne',
    no = 'no',
    nb = 'nb',
    nn = 'nn',
    oc = 'oc',
    oj = 'oj',
    or = 'or',
    om = 'om',
    os = 'os',
    pi = 'pi',
    ps = 'ps',
    fa = 'fa',
    pl = 'pl',
    pt = 'pt',
    pa = 'pa',
    qu = 'qu',
    ro = 'ro',
    rm = 'rm',
    rn = 'rn',
    ru = 'ru',
    se = 'se',
    sm = 'sm',
    sg = 'sg',
    sa = 'sa',
    sc = 'sc',
    sr = 'sr',
    sn = 'sn',
    sd = 'sd',
    si = 'si',
    sk = 'sk',
    sl = 'sl',
    so = 'so',
    st = 'st',
    es = 'es',
    su = 'su',
    sw = 'sw',
    ss = 'ss',
    sv = 'sv',
    tl = 'tl',
    ty = 'ty',
    tg = 'tg',
    ta = 'ta',
    tt = 'tt',
    te = 'te',
    th = 'th',
    bo = 'bo',
    ti = 'ti',
    to = 'to',
    ts = 'ts',
    tn = 'tn',
    tr = 'tr',
    tk = 'tk',
    tw = 'tw',
    ug = 'ug',
    uk = 'uk',
    ur = 'ur',
    uz = 'uz',
    ve = 've',
    vi = 'vi',
    vo = 'vo',
    wa = 'wa',
    cy = 'cy',
    wo = 'wo',
    xh = 'xh',
    ii = 'ii',
    yi = 'yi',
    yo = 'yo',
    za = 'za',
    zu = 'zu'
}

export interface TwitterUser {
    id: string;
    url: string;
    name: string;
    username: string;
    created_at: string;
    description: string;
    favourites_count: number;
    followers_count: number;
    listed_count: number;
    media_count: number;
    profile_image_url: string;
    statuses_count: string;
    verified: boolean;
}

export interface TwitterPost {
    id: string;
    text: string;
    reply_count: number;
    retweet_count: number;
    like_count: number;
    view_count: number;
    quote_count: number;
    impression_count: number;
    bookmark_count: number;
    url: string;
    created_at: string;
    media: any[];
    is_quote_tweet: boolean;
    is_retweet: boolean;
    user: TwitterUser;
}

export type TwitterAPIResponse = TwitterPost[];

export default async function queryTwitter(
    query: string,
    sort?: "Top" | "Latest",
    startDate?: DateString,
    lang?: LangCode
) {
    debuggerLog('querying', query);
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'dt_$r0ob3iPRx1ATJC_ez6l6xBFmLaw2qaTwdeR4f-nHxgo',
            'Content-Type': 'application/json'
        },
        body: `{"query":"${query}"${lang ? `,"lang":"${lang}"` : ''}${sort ? `,"sort":"${sort}"` : ''}${startDate ? `,"start_date":"${startDate}"` : ''}}`
    };

    debuggerLog(`calling {"query":"${query}"${lang ? `,"lang":"${lang}"` : ''}${sort ? `,"sort":"${sort}"` : ''}${startDate ? `,"start_date":"${startDate}"` : ''}}`)

    const response = (await (await fetch('https://apis.datura.ai/twitter', options)).json() as TwitterAPIResponse).slice(0, 12);
    // debuggerLog(response);

    return response as TwitterAPIResponse;
}