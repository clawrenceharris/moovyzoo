import{j as e}from"./jsx-runtime-Bg5fjw9X.js";import{r,e as K}from"./iframe-BYNQwDXw.js";import{c as w}from"./utils-CBfrqCZ4.js";import{c as N,B as P}from"./button-DeCiuNqF.js";import{t as U}from"./service-C8MYG0PT.js";import{S as H}from"./search-D-dy8PJ7.js";import"./preload-helper-D9Z9MdNV.js";/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],J=N("circle-alert",Z);/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M7 3v18",key:"bbkbws"}],["path",{d:"M3 7.5h4",key:"zfgn84"}],["path",{d:"M3 12h18",key:"1i2n21"}],["path",{d:"M3 16.5h4",key:"1230mu"}],["path",{d:"M17 3v18",key:"in4fa5"}],["path",{d:"M17 7.5h4",key:"myr1c1"}],["path",{d:"M17 16.5h4",key:"go4c1d"}]],B=N("film",X);/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],G=N("loader-circle",Y);/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=[["path",{d:"m17 2-5 5-5-5",key:"16satq"}],["rect",{width:"20",height:"15",x:"2",y:"7",rx:"2",key:"1e6viu"}]],W=N("tv",ee);/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],se=N("x",ae);function A({className:a,type:s,...i}){return e.jsx("input",{type:s,"data-slot":"input",className:w("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm","focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]","aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",a),...i})}A.__docgenInfo={description:"",methods:[],displayName:"Input"};function te(a,s){const[i,n]=r.useState(a);return r.useEffect(()=>{const p=setTimeout(()=>{n(a)},s);return()=>{clearTimeout(p)}},[a,s]),i}function re(a,s=300,i=3){const n=te(a,s),p=n.length>=i;return{debouncedTerm:n,shouldSearch:p}}function ne(){const[a,s]=r.useState(""),[i,n]=r.useState([]),[p,o]=r.useState(!1),[f,m]=r.useState(null),[x,l]=r.useState(!1),{debouncedTerm:h,shouldSearch:y}=re(a,300,3),b=r.useCallback(async u=>{if(!u||u.length<3){n([]),m(null),l(!1);return}o(!0),m(null);try{const g=await U.searchMedia(u);n(g),l(!0)}catch(g){console.error("Media search error:",g);let v="Failed to search for media. Please try again.";if(g instanceof Error)switch(g.message){case"TMDB_RATE_LIMIT_EXCEEDED":v="Too many requests. Please wait a moment and try again.";break;case"TMDB_UNAUTHORIZED":v="Unable to access movie database. Please contact support.";break;case"TMDB_NETWORK_ERROR":v="Network error. Please check your connection and try again.";break;case"TMDB_SEARCH_FAILED":default:v="Search failed. Please try again.";break}m(v),n([]),l(!0)}finally{o(!1)}},[]);r.useEffect(()=>{y?b(h):h.length===0&&(n([]),m(null),l(!1))},[h,y,b]);const j=r.useCallback(u=>{s(u)},[]),c=r.useCallback(()=>{s(""),n([]),m(null),l(!1)},[]),S=r.useCallback(()=>{a&&b(a)},[a,b]);return{results:i,isLoading:p,error:f,hasSearched:x,search:j,clearResults:c,retry:S}}function I({onMediaSelect:a,selectedMedia:s,placeholder:i="Search for movies and TV shows...",disabled:n=!1,className:p}){const[o,f]=r.useState(""),[m,x]=r.useState(!1),[l,h]=r.useState(-1),y=r.useRef(null),b=r.useRef(null),j=r.useRef([]),{results:c,isLoading:S,error:u,hasSearched:g,search:v,clearResults:V,retry:L}=ne(),$=r.useCallback(t=>{const d=t.target.value;f(d),v(d),x(!0),h(-1)},[v]),R=r.useCallback(t=>{const d={tmdb_id:t.id,media_type:t.media_type,title:t.title||t.name||"",media_title:t.title||t.name||"",poster_path:t.poster_path,release_date:t.release_date||t.first_air_date,runtime:t.runtime};a(d),f(d.title),x(!1),h(-1)},[a]),z=r.useCallback(()=>{a(null),f(""),V(),x(!1),h(-1),y.current?.focus()},[a,V]),O=r.useCallback(t=>{if(!(!m||c.length===0))switch(t.key){case"ArrowDown":t.preventDefault(),h(d=>d<c.length-1?d+1:0);break;case"ArrowUp":t.preventDefault(),h(d=>d>0?d-1:c.length-1);break;case"Enter":t.preventDefault(),l>=0&&l<c.length&&R(c[l]);break;case"Escape":t.preventDefault(),x(!1),h(-1),y.current?.blur();break}},[m,c,l,R]);r.useEffect(()=>{l>=0&&j.current[l]&&j.current[l]?.scrollIntoView({block:"nearest",behavior:"smooth"})},[l]),r.useEffect(()=>{const t=d=>{b.current&&!b.current.contains(d.target)&&!y.current?.contains(d.target)&&(x(!1),h(-1))};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]),r.useEffect(()=>{s&&!o&&f(s.title)},[s,o]);const F=m&&(c.length>0||S||u||g&&o.length>=3);return e.jsxs("div",{className:w("relative w-full",p),children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",children:e.jsx(H,{className:"h-4 w-4"})}),e.jsx(A,{ref:y,type:"text",value:o,onChange:$,onKeyDown:O,onFocus:()=>{(c.length>0||u)&&x(!0)},placeholder:i,disabled:n,className:w("pl-10 pr-10",s&&"border-accent/50 bg-accent/5"),"aria-expanded":F?"true":"false","aria-haspopup":"listbox","aria-autocomplete":"list",role:"combobox"}),(o||s)&&!n&&e.jsx(P,{type:"button",variant:"ghost",size:"sm",onClick:z,className:"absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted","aria-label":"Clear selection",children:e.jsx(se,{className:"h-3 w-3"})})]}),F&&e.jsxs("div",{ref:b,className:"media-search-dropdown",role:"listbox",children:[S&&e.jsxs("div",{className:"flex items-center justify-center p-4 text-sm text-muted-foreground",children:[e.jsx(G,{className:"mr-2 h-4 w-4 animate-spin"}),"Searching..."]}),u&&e.jsxs("div",{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm text-destructive mb-2",children:[e.jsx(J,{className:"h-4 w-4"}),u]}),e.jsx(P,{type:"button",variant:"outline",size:"sm",onClick:L,className:"w-full",children:"Try Again"})]}),!S&&!u&&g&&c.length===0&&o.length>=3&&e.jsxs("div",{className:"p-4 text-center text-sm text-muted-foreground",children:['No movies or TV shows found for "',o,'"']}),!S&&!u&&c.length>0&&e.jsx("div",{className:"py-1",children:c.map((t,d)=>e.jsx(q,{ref:Q=>{j.current[d]=Q},result:t,isSelected:s?.tmdb_id===t.id,isFocused:l===d,onClick:()=>R(t)},`${t.media_type}-${t.id}`))})]})]})}const q=K.forwardRef(({result:a,isSelected:s,isFocused:i,onClick:n},p)=>{const o=a.title||a.name||"",f=a.release_date||a.first_air_date?new Date(a.release_date||a.first_air_date||"").getFullYear():null,m=a.poster_path?`https://image.tmdb.org/t/p/w92${a.poster_path}`:null;return e.jsxs("button",{ref:p,type:"button",onClick:n,className:w("media-search-result",i&&"focused",s&&"selected"),role:"option","aria-selected":s,children:[e.jsx("div",{className:"media-search-poster",children:m?e.jsx("img",{src:m,alt:`${o} poster`,className:"w-full h-full object-cover",loading:"lazy"}):e.jsx("div",{className:"media-search-poster-placeholder",children:a.media_type==="movie"?e.jsx(B,{className:"h-6 w-6 text-muted-foreground"}):e.jsx(W,{className:"h-6 w-6 text-muted-foreground"})})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("h4",{className:"font-medium text-sm truncate",children:o}),f&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",f,")"]})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("span",{className:w("media-type-badge",a.media_type==="movie"?"movie":"tv"),children:a.media_type==="movie"?e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"h-3 w-3"}),"Movie"]}):e.jsxs(e.Fragment,{children:[e.jsx(W,{className:"h-3 w-3"}),"TV Show"]})})})]})]})});q.displayName="SearchResultItem";I.__docgenInfo={description:"",methods:[],displayName:"MediaSearchField",props:{onMediaSelect:{required:!0,tsType:{name:"signature",type:"function",raw:"(media: SelectedMedia | null) => void",signature:{arguments:[{type:{name:"union",raw:"SelectedMedia | null",elements:[{name:"SelectedMedia"},{name:"null"}]},name:"media"}],return:{name:"void"}}},description:""},selectedMedia:{required:!1,tsType:{name:"union",raw:"SelectedMedia | null",elements:[{name:"SelectedMedia"},{name:"null"}]},description:""},placeholder:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Search for movies and TV shows..."',computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const he={title:"Components/Media/MediaSearchField",component:I,parameters:{layout:"centered",docs:{description:{component:"A search field component for finding movies and TV shows using TMDB API with debounced search, keyboard navigation, and media selection."}}},tags:["autodocs"],argTypes:{onMediaSelect:{action:"media-selected"},placeholder:{control:"text",description:"Placeholder text for the search input"},disabled:{control:"boolean",description:"Whether the search field is disabled"},className:{control:"text",description:"Additional CSS classes"}}};function M(a){const[s,i]=r.useState(null);return e.jsxs("div",{className:"w-96 p-4",children:[e.jsx(I,{...a,selectedMedia:s,onMediaSelect:n=>{i(n),a.onMediaSelect?.(n)}}),s&&e.jsxs("div",{className:"mt-4 p-3 bg-card border rounded-lg",children:[e.jsx("h4",{className:"font-medium text-sm mb-2",children:"Selected Media:"}),e.jsxs("div",{className:"text-xs space-y-1",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Title:"})," ",s.title]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Type:"})," ",s.media_type]}),e.jsxs("div",{children:[e.jsx("strong",{children:"TMDB ID:"})," ",s.tmdb_id]}),s.release_date&&e.jsxs("div",{children:[e.jsx("strong",{children:"Release:"})," ",s.release_date]})]})]})]})}const _={render:a=>e.jsx(M,{...a}),args:{placeholder:"Search for movies and TV shows...",disabled:!1}},k={render:a=>e.jsx(M,{...a}),args:{placeholder:"Find your favorite movie or series...",disabled:!1}},T={render:a=>e.jsx(M,{...a}),args:{placeholder:"Search for movies and TV shows...",disabled:!0}},D={render:a=>{const[s,i]=r.useState({tmdb_id:550,media_type:"movie",title:"Fight Club",media_title:"Fight Club",poster_path:"/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",release_date:"1999-10-15"});return e.jsxs("div",{className:"w-96 p-4",children:[e.jsx(I,{...a,selectedMedia:s,onMediaSelect:n=>{i(n),a.onMediaSelect?.(n)}}),s&&e.jsxs("div",{className:"mt-4 p-3 bg-card border rounded-lg",children:[e.jsx("h4",{className:"font-medium text-sm mb-2",children:"Selected Media:"}),e.jsxs("div",{className:"text-xs space-y-1",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Title:"})," ",s.title]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Type:"})," ",s.media_type]}),e.jsxs("div",{children:[e.jsx("strong",{children:"TMDB ID:"})," ",s.tmdb_id]}),s.release_date&&e.jsxs("div",{children:[e.jsx("strong",{children:"Release:"})," ",s.release_date]})]})]})]})},args:{placeholder:"Search for movies and TV shows...",disabled:!1}},C={render:a=>e.jsx(M,{...a}),args:{placeholder:"Search movies & shows...",disabled:!1},parameters:{viewport:{defaultViewport:"mobile1"}}},E={render:a=>e.jsxs("div",{className:"max-w-md mx-auto p-6 bg-card border rounded-lg",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Create Watch Party"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Party Title"}),e.jsx("input",{type:"text",placeholder:"Enter party title...",className:"w-full px-3 py-2 border rounded-md"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Select Movie or TV Show"}),e.jsx(M,{...a})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Description"}),e.jsx("textarea",{placeholder:"Tell people what this party is about...",className:"w-full px-3 py-2 border rounded-md h-20 resize-none"})]}),e.jsx("button",{className:"w-full bg-primary text-primary-foreground py-2 rounded-md font-medium",children:"Create Watch Party"})]})]}),args:{placeholder:"Search for movies and TV shows...",disabled:!1}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => <MediaSearchWrapper {...args} />,
  args: {
    placeholder: "Search for movies and TV shows...",
    disabled: false
  }
}`,..._.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => <MediaSearchWrapper {...args} />,
  args: {
    placeholder: "Find your favorite movie or series...",
    disabled: false
  }
}`,...k.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => <MediaSearchWrapper {...args} />,
  args: {
    placeholder: "Search for movies and TV shows...",
    disabled: true
  }
}`,...T.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>({
      tmdb_id: 550,
      media_type: "movie",
      title: "Fight Club",
      media_title: "Fight Club",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      release_date: "1999-10-15"
    });
    return <div className="w-96 p-4">
        <MediaSearchField {...args} selectedMedia={selectedMedia} onMediaSelect={media => {
        setSelectedMedia(media);
        args.onMediaSelect?.(media);
      }} />

        {selectedMedia && <div className="mt-4 p-3 bg-card border rounded-lg">
            <h4 className="font-medium text-sm mb-2">Selected Media:</h4>
            <div className="text-xs space-y-1">
              <div>
                <strong>Title:</strong> {selectedMedia.title}
              </div>
              <div>
                <strong>Type:</strong> {selectedMedia.media_type}
              </div>
              <div>
                <strong>TMDB ID:</strong> {selectedMedia.tmdb_id}
              </div>
              {selectedMedia.release_date && <div>
                  <strong>Release:</strong> {selectedMedia.release_date}
                </div>}
            </div>
          </div>}
      </div>;
  },
  args: {
    placeholder: "Search for movies and TV shows...",
    disabled: false
  }
}`,...D.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => <MediaSearchWrapper {...args} />,
  args: {
    placeholder: "Search movies & shows...",
    disabled: false
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    }
  }
}`,...C.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-md mx-auto p-6 bg-card border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Create Watch Party</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Party Title</label>
          <input type="text" placeholder="Enter party title..." className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Select Movie or TV Show
          </label>
          <MediaSearchWrapper {...args} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea placeholder="Tell people what this party is about..." className="w-full px-3 py-2 border rounded-md h-20 resize-none" />
        </div>

        <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
          Create Watch Party
        </button>
      </div>
    </div>,
  args: {
    placeholder: "Search for movies and TV shows...",
    disabled: false
  }
}`,...E.parameters?.docs?.source}}};const pe=["Default","WithCustomPlaceholder","Disabled","WithPreselectedMedia","MobileView","InFormContext"];export{_ as Default,T as Disabled,E as InFormContext,C as MobileView,k as WithCustomPlaceholder,D as WithPreselectedMedia,pe as __namedExportsOrder,he as default};
