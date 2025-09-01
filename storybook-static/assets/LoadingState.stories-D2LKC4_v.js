import{j as e}from"./jsx-runtime-Bg5fjw9X.js";import{c as b}from"./utils-CBfrqCZ4.js";import"./iframe-BYNQwDXw.js";import"./preload-helper-D9Z9MdNV.js";function l({variant:d="grid",count:m=6,className:u}){const c=a=>e.jsxs("div",{className:"habitat-card animate-pulse","data-testid":"loading-card",children:[e.jsx("div",{className:"habitat-card-banner",children:e.jsx("div",{className:"w-full h-full bg-muted"})}),e.jsxs("div",{className:"card-content",children:[e.jsxs("div",{children:[e.jsx("div",{className:"h-6 bg-white/20 rounded w-3/4 mb-2"}),e.jsx("div",{className:"h-4 bg-white/20 rounded w-full mb-1"}),e.jsx("div",{className:"h-4 bg-white/20 rounded w-2/3"})]}),e.jsxs("div",{className:"card-footer",children:[e.jsx("div",{className:"h-8 bg-white/20 rounded-full w-24"}),e.jsx("div",{className:"h-10 bg-white/20 rounded-lg w-28"})]})]})]},a),p=a=>e.jsxs("div",{className:"p-4 border border-border rounded-lg animate-pulse","data-testid":"loading-item",children:[e.jsxs("div",{className:"flex items-start justify-between mb-2",children:[e.jsx("div",{className:"h-4 bg-muted rounded w-48"}),e.jsx("div",{className:"h-3 bg-muted rounded w-12"})]}),e.jsx("div",{className:"h-3 bg-muted rounded w-full mb-2"}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"h-3 bg-muted rounded w-32"}),e.jsx("div",{className:"h-3 bg-muted rounded w-20"})]})]},a),g=a=>e.jsx("div",{className:"w-32 h-20 bg-muted rounded animate-pulse","data-testid":"loading-item"},a),v=a=>e.jsxs("div",{className:"p-4 border border-border rounded-lg animate-pulse","data-testid":"loading-item",children:[e.jsx("div",{className:"h-4 bg-muted rounded w-3/4 mb-2"}),e.jsx("div",{className:"h-3 bg-muted rounded w-full mb-1"}),e.jsx("div",{className:"h-3 bg-muted rounded w-2/3"})]},a),h=a=>{switch(d){case"grid":return c(a);case"list":return p(a);case"inline":return g(a);case"card":return v(a);default:return c(a)}};return e.jsx("div",{className:b("loading-state",`loading-state-${d}`,u),"data-testid":"loading-state",children:Array.from({length:m}).map((a,f)=>h(f))})}l.__docgenInfo={description:`LoadingState component provides consistent loading skeletons across different layouts.

This component renders animated skeleton placeholders that match the expected content
structure for different UI contexts. It supports multiple variants optimized for
different use cases like grids, lists, inline content, and cards.

@example
\`\`\`tsx
// Grid layout for habitat cards
<LoadingState variant="grid" count={6} />

// List layout for discussions
<LoadingState variant="list" count={3} />

// Inline loading for small components
<LoadingState variant="inline" count={4} />
\`\`\`

@param props - The component props
@returns A loading skeleton component with animated placeholders`,methods:[],displayName:"LoadingState",props:{variant:{required:!1,tsType:{name:"union",raw:'"grid" | "list" | "inline" | "card"',elements:[{name:"literal",value:'"grid"'},{name:"literal",value:'"list"'},{name:"literal",value:'"inline"'},{name:"literal",value:'"card"'}]},description:"The layout variant to render - affects the skeleton structure and layout",defaultValue:{value:'"grid"',computed:!1}},count:{required:!1,tsType:{name:"number"},description:"Number of skeleton items to display",defaultValue:{value:"6",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes to apply to the container"}}};const w={title:"Components/States/LoadingState",component:l,parameters:{layout:"padded",docs:{description:{component:"LoadingState provides consistent loading skeletons across different layouts with animated placeholders."}}},argTypes:{variant:{control:"select",options:["grid","list","inline","card"],description:"The layout variant to render"},count:{control:{type:"number",min:1,max:12},description:"Number of skeleton items to display"},className:{control:"text",description:"Additional CSS classes"}}},t={args:{variant:"grid",count:6}},s={args:{variant:"list",count:4}},r={args:{variant:"inline",count:5}},n={args:{variant:"card",count:3}},i={args:{variant:"grid",count:1}},o={args:{variant:"list",count:10}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "grid",
    count: 6
  }
}`,...t.parameters?.docs?.source},description:{story:"Default grid layout optimized for habitat cards",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "list",
    count: 4
  }
}`,...s.parameters?.docs?.source},description:{story:"List layout for discussions and content lists",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inline",
    count: 5
  }
}`,...r.parameters?.docs?.source},description:{story:"Inline layout for small components and navigation",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    count: 3
  }
}`,...n.parameters?.docs?.source},description:{story:"Card layout for general content cards",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "grid",
    count: 1
  }
}`,...i.parameters?.docs?.source},description:{story:"Single item loading state",...i.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "list",
    count: 10
  }
}`,...o.parameters?.docs?.source},description:{story:"Many items loading state",...o.parameters?.docs?.description}}};const S=["Grid","List","Inline","Card","SingleItem","ManyItems"];export{n as Card,t as Grid,r as Inline,s as List,o as ManyItems,i as SingleItem,S as __namedExportsOrder,w as default};
