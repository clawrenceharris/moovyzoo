import{j as e}from"./jsx-runtime-Bg5fjw9X.js";import{t as q}from"./service-C8MYG0PT.js";import"./iframe-BYNQwDXw.js";import"./preload-helper-D9Z9MdNV.js";function a({watchParty:t,onClick:T,showDescription:L=!0,showMediaInfo:D=!0,className:V=""}){const o=new Date(t.scheduled_time),W=new Date,E=o>W,$=Math.abs(o.getTime()-W.getTime())<=1800*1e3,n=$?{text:"Live",color:"text-green-500"}:E?{text:"Upcoming",color:"text-blue-500"}:{text:"Ended",color:"text-muted-foreground"},I=!!(t.tmdb_id&&t.media_type&&t.media_title),M=()=>t.poster_path?q.getPosterUrl(t.poster_path,"w342"):"",B=()=>t.media_type?t.media_type==="movie"?"Movie":"TV Show":"",j=()=>t.release_date?new Date(t.release_date).getFullYear().toString():"",_=()=>t.media_title||"",S=()=>{if(!t.runtime)return"";const c=Math.floor(t.runtime/60),s=t.runtime%60;return c>0?`${c}h ${s}m`:`${s}m`};return e.jsxs("div",{onClick:T,className:`p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group ${V}`,"data-testid":"watch-party-card",children:[D&&I&&e.jsxs("div",{className:"flex gap-3 mb-3",children:[e.jsxs("div",{className:"flex-shrink-0",children:[M()?e.jsx("img",{src:M(),alt:`${_()} poster`,className:"w-16 h-24 sm:w-20 sm:h-30 object-cover rounded-md bg-muted",onError:c=>{const s=c.target;s.style.display="none",s.nextElementSibling?.classList.remove("hidden")},"data-testid":"watch-party-poster"}):null,e.jsx("div",{className:`w-16 h-24 sm:w-20 sm:h-30 bg-muted rounded-md flex items-center justify-center ${M()?"hidden":""}`,"data-testid":"watch-party-poster-fallback",children:e.jsx("svg",{className:"w-6 h-6 text-muted-foreground",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4m0 0H5a1 1 0 00-1 1v14a1 1 0 001 1h2m0 0h10"})})})]}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-start justify-between mb-1",children:[e.jsx("h5",{className:"font-medium text-sm text-foreground line-clamp-1","data-testid":"watch-party-media-title",children:_()}),e.jsx("span",{className:`text-xs font-medium ${n.color} ml-2 flex-shrink-0`,"data-testid":"watch-party-status",children:n.text})]}),e.jsxs("div",{className:"flex items-center gap-2 mb-1 flex-wrap",children:[e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent","data-testid":"watch-party-media-type",children:B()}),j()&&e.jsx("span",{className:"text-xs text-muted-foreground","data-testid":"watch-party-release-year",children:j()}),S()&&e.jsx("span",{className:"text-xs text-muted-foreground","data-testid":"watch-party-runtime",children:S()})]})]})]}),e.jsxs("div",{className:"flex items-start justify-between mb-2",children:[e.jsx("h4",{className:"font-medium text-foreground group-hover:text-primary transition-colors",children:t.title}),(!D||!I)&&e.jsx("span",{className:`text-xs font-medium ${n.color}`,"data-testid":"watch-party-status",children:n.text})]}),L&&t.description&&e.jsx("p",{className:"text-sm text-muted-foreground mb-2 line-clamp-2",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between text-xs text-muted-foreground",children:[e.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 flex-wrap",children:[e.jsx("span",{"data-testid":"watch-party-date",children:o.toLocaleDateString()}),e.jsx("span",{"data-testid":"watch-party-time",children:o.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),e.jsxs("span",{"data-testid":"watch-party-participants",children:[t.participant_count," joined"]})]}),e.jsx("span",{className:"text-accent ml-2 flex-shrink-0","data-testid":"watch-party-action",children:t.is_participant?"Joined →":"Join party →"})]})]})}a.__docgenInfo={description:`WatchPartyCard component displays watch party information with status, scheduling, and media content.

This component renders watch party details including title, scheduled time,
participant count, real-time status (Live/Upcoming/Ended), and associated media
content with poster images, media titles, and type badges. It provides
dynamic status indicators and participation feedback with rich media display.

@example
\`\`\`tsx
// Basic watch party card with media
<WatchPartyCard
  watchParty={partyData}
  onClick={() => router.push(\`/watch-parties/\${partyData.id}\`)}
  showMediaInfo={true}
/>

// Without description but with media
<WatchPartyCard
  watchParty={partyData}
  onClick={handleJoin}
  showDescription={false}
  showMediaInfo={true}
/>
\`\`\`

@param props - The component props
@returns A clickable watch party card with status indicators, scheduling info, and media content`,methods:[],displayName:"WatchPartyCard",props:{watchParty:{required:!0,tsType:{name:"WatchPartyWithParticipants"},description:"The watch party data to display"},onClick:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when the card is clicked"},showDescription:{required:!1,tsType:{name:"boolean"},description:"Whether to show the watch party description",defaultValue:{value:"true",computed:!1}},showMediaInfo:{required:!1,tsType:{name:"boolean"},description:"Whether to show media information (poster, title, etc.)",defaultValue:{value:"true",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes to apply",defaultValue:{value:'""',computed:!1}}}};const Y={title:"Components/Cards/WatchPartyCard",component:a,parameters:{layout:"centered",docs:{description:{component:"WatchPartyCard displays watch party information with status, scheduling, and optional media content including poster images and metadata."}}},argTypes:{onClick:{action:"clicked"},showDescription:{control:"boolean",description:"Whether to show the watch party description"},showMediaInfo:{control:"boolean",description:"Whether to show media information (poster, title, etc.)"},className:{control:"text",description:"Additional CSS classes to apply"}},decorators:[t=>e.jsx("div",{className:"w-80 p-4",children:e.jsx(t,{})})]},i={id:"1",habitat_id:"habitat-1",title:"Friday Night Movie Marathon",description:"Join us for an epic movie night with popcorn and great company!",scheduled_time:new Date(Date.now()+7200*1e3).toISOString(),participant_count:8,max_participants:15,created_by:"user-1",created_at:new Date().toISOString(),is_active:!0,participants:[],is_participant:!1},r={...i,title:"Inception Watch Party",description:"Mind-bending sci-fi thriller that will leave you questioning reality.",tmdb_id:27205,media_type:"movie",media_title:"Inception",poster_path:"/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",release_date:"2010-07-16",runtime:148},P={...i,title:"Breaking Bad Season Finale",description:"The epic conclusion to one of the greatest TV series ever made.",tmdb_id:1396,media_type:"tv",media_title:"Breaking Bad",poster_path:"/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",release_date:"2008-01-20",runtime:47},b={...r,title:"LIVE: The Dark Knight",scheduled_time:new Date(Date.now()-600*1e3).toISOString(),participant_count:12,is_participant:!0},C={...P,title:"Stranger Things Rewatch",scheduled_time:new Date(Date.now()-10800*1e3).toISOString(),participant_count:6,is_participant:!1},N={...i,title:"Community Movie Night",description:"Bring your favorite movie suggestions and we'll vote on what to watch!"},k={...i,title:"Indie Film Festival",description:"Discover hidden gems in independent cinema.",tmdb_id:12345,media_type:"movie",media_title:"Unknown Indie Film",poster_path:void 0,release_date:"2023-01-01",runtime:95},d={args:{watchParty:i,showDescription:!0,showMediaInfo:!0}},p={args:{watchParty:r,showDescription:!0,showMediaInfo:!0}},h={args:{watchParty:P,showDescription:!0,showMediaInfo:!0}},l={args:{watchParty:b,showDescription:!0,showMediaInfo:!0}},m={args:{watchParty:C,showDescription:!0,showMediaInfo:!0}},u={args:{watchParty:N,showDescription:!0,showMediaInfo:!0}},w={args:{watchParty:k,showDescription:!0,showMediaInfo:!0}},g={args:{watchParty:r,showDescription:!1,showMediaInfo:!0}},y={args:{watchParty:r,showDescription:!0,showMediaInfo:!1}},f={args:{watchParty:r,showDescription:!1,showMediaInfo:!1}},x={args:{watchParty:r,showDescription:!0,showMediaInfo:!0},decorators:[t=>e.jsx("div",{className:"w-64 p-4",children:e.jsx(t,{})})]},v={args:{watchParty:r,showDescription:!0,showMediaInfo:!0},decorators:[t=>e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl",children:[e.jsx(t,{}),e.jsx(a,{watchParty:P,onClick:()=>{},showDescription:!0,showMediaInfo:!0}),e.jsx(a,{watchParty:b,onClick:()=>{},showDescription:!0,showMediaInfo:!0}),e.jsx(a,{watchParty:C,onClick:()=>{},showDescription:!0,showMediaInfo:!0}),e.jsx(a,{watchParty:N,onClick:()=>{},showDescription:!0,showMediaInfo:!0}),e.jsx(a,{watchParty:k,onClick:()=>{},showDescription:!0,showMediaInfo:!0})]})]};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: baseWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: tvWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...h.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: liveWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: endedWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: noMediaWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...u.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: missingPosterWatchParty,
    showDescription: true,
    showMediaInfo: true
  }
}`,...w.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: false,
    showMediaInfo: true
  }
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: false
  }
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: false,
    showMediaInfo: false
  }
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true
  },
  decorators: [Story => <div className="w-64 p-4">
        <Story />
      </div>]
}`,...x.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true
  },
  decorators: [Story => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl">
        <Story />
        <WatchPartyCard watchParty={tvWatchParty} onClick={() => {}} showDescription={true} showMediaInfo={true} />
        <WatchPartyCard watchParty={liveWatchParty} onClick={() => {}} showDescription={true} showMediaInfo={true} />
        <WatchPartyCard watchParty={endedWatchParty} onClick={() => {}} showDescription={true} showMediaInfo={true} />
        <WatchPartyCard watchParty={noMediaWatchParty} onClick={() => {}} showDescription={true} showMediaInfo={true} />
        <WatchPartyCard watchParty={missingPosterWatchParty} onClick={() => {}} showDescription={true} showMediaInfo={true} />
      </div>]
}`,...v.parameters?.docs?.source}}};const A=["Default","WithMovieMedia","WithTVShowMedia","LiveStatus","EndedStatus","NoMedia","MissingPoster","WithoutDescription","WithoutMediaInfo","Minimal","MobileView","GridLayout"];export{d as Default,m as EndedStatus,v as GridLayout,l as LiveStatus,f as Minimal,w as MissingPoster,x as MobileView,u as NoMedia,p as WithMovieMedia,h as WithTVShowMedia,g as WithoutDescription,y as WithoutMediaInfo,A as __namedExportsOrder,Y as default};
