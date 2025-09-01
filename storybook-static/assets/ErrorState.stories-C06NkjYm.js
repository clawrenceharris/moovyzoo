import{j as e}from"./jsx-runtime-Bg5fjw9X.js";import{c as y}from"./utils-CBfrqCZ4.js";import{c as v,B as g}from"./button-DeCiuNqF.js";import"./iframe-BYNQwDXw.js";import"./preload-helper-D9Z9MdNV.js";/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],C=v("database",E);/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]],T=v("wifi",S);function w({variant:k="default",title:m="Something went wrong",message:t="We encountered an error while loading this content. Please try again.",icon:u,onRetry:r,retryLabel:p="Try Again",className:h,showIcon:f=!0}){const x=e.jsx("svg",{className:"w-12 h-12 text-destructive",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"})}),b=()=>e.jsx("div",{className:y("error-state","error-state-minimal",h),"data-testid":"error-state",children:e.jsxs("div",{className:"flex items-center gap-2 text-destructive",children:[f&&(u||e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})),e.jsx("span",{className:"text-sm font-medium",children:m}),r&&e.jsx(g,{variant:"ghost",size:"sm",onClick:r,className:"h-auto p-1 text-xs",children:p})]})}),N=()=>e.jsx("div",{className:y("error-state","error-state-inline",h),"data-testid":"error-state",children:e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg",children:[f&&(u||e.jsx("svg",{className:"w-5 h-5 text-destructive flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4m0 4h.01"})})),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-destructive",children:m}),t&&e.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:t})]}),r&&e.jsx(g,{variant:"outline",size:"sm",onClick:r,className:"flex-shrink-0",children:p})]})}),j=()=>e.jsx("div",{className:y("error-state","error-state-card",h),"data-testid":"error-state",children:e.jsxs("div",{className:"p-6 bg-card border border-border rounded-lg text-center",children:[f&&e.jsx("div",{className:"flex justify-center mb-4",children:u||x}),e.jsx("h3",{className:"text-lg font-semibold text-foreground mb-2",children:m}),t&&e.jsx("p",{className:"text-muted-foreground mb-4 max-w-md mx-auto",children:t}),r&&e.jsx(g,{onClick:r,variant:"outline",children:p})]})}),R=()=>e.jsx("div",{className:y("error-state","error-state-default",h),"data-testid":"error-state",children:e.jsxs("div",{className:"flex flex-col items-center justify-center py-12 px-4 text-center",children:[f&&e.jsx("div",{className:"mb-4",children:u||x}),e.jsx("h3",{className:"text-xl font-semibold text-foreground mb-2",children:m}),t&&e.jsx("p",{className:"text-muted-foreground mb-6 max-w-md",children:t}),r&&e.jsx(g,{onClick:r,variant:"default",children:p})]})});return(()=>{switch(k){case"minimal":return b();case"inline":return N();case"card":return j();case"default":default:return R()}})()}w.__docgenInfo={description:`ErrorState component provides consistent error display with retry functionality.

This component handles different error scenarios with appropriate visual feedback
and user actions. It supports multiple variants for different UI contexts and
provides customizable retry mechanisms.

@example
\`\`\`tsx
// Default error state with retry
<ErrorState
  title="Failed to load habitats"
  message="Check your connection and try again"
  onRetry={handleRetry}
/>

// Minimal inline error
<ErrorState
  variant="minimal"
  title="Upload failed"
  onRetry={handleRetry}
/>

// Card-style error with custom icon
<ErrorState
  variant="card"
  title="Network Error"
  icon={<NetworkIcon />}
/>
\`\`\`

@param props - The component props
@returns An error display component with optional retry functionality`,methods:[],displayName:"ErrorState",props:{variant:{required:!1,tsType:{name:"union",raw:'"default" | "minimal" | "card" | "inline"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"minimal"'},{name:"literal",value:'"card"'},{name:"literal",value:'"inline"'}]},description:"The display variant - affects layout and styling",defaultValue:{value:'"default"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"The error title/heading",defaultValue:{value:'"Something went wrong"',computed:!1}},message:{required:!1,tsType:{name:"string"},description:"Detailed error message",defaultValue:{value:'"We encountered an error while loading this content. Please try again."',computed:!1}},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Custom icon to display (overrides default)"},onRetry:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback function for retry action"},retryLabel:{required:!1,tsType:{name:"string"},description:"Text for the retry button",defaultValue:{value:'"Try Again"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes to apply"},showIcon:{required:!1,tsType:{name:"boolean"},description:"Whether to show the error icon",defaultValue:{value:"true",computed:!1}}}};const P={title:"Components/States/ErrorState",component:w,parameters:{layout:"padded",docs:{description:{component:"ErrorState provides consistent error display with retry functionality across different UI contexts."}}},argTypes:{variant:{control:"select",options:["default","minimal","card","inline"],description:"The display variant"},title:{control:"text",description:"The error title/heading"},message:{control:"text",description:"Detailed error message"},retryLabel:{control:"text",description:"Text for the retry button"},showIcon:{control:"boolean",description:"Whether to show the error icon"}}},a={args:{variant:"default",title:"Failed to load habitats",message:"We encountered an error while loading your habitats. Please check your connection and try again.",onRetry:()=>alert("Retry clicked!")}},n={args:{variant:"minimal",title:"Upload failed",onRetry:()=>alert("Retry clicked!")}},s={args:{variant:"card",title:"Network Error",message:"Unable to connect to the server. Please check your internet connection.",onRetry:()=>alert("Retry clicked!")}},o={args:{variant:"inline",title:"Validation Error",message:"Please check your input and try again.",onRetry:()=>alert("Retry clicked!")}},i={args:{variant:"default",title:"Connection Lost",message:"Unable to connect to Zoovie servers.",icon:e.jsx(T,{className:"w-12 h-12 text-destructive"}),onRetry:()=>alert("Retry clicked!")}},c={args:{variant:"card",title:"Database Error",message:"There was a problem accessing your data.",icon:e.jsx(C,{className:"w-12 h-12 text-destructive"}),onRetry:()=>alert("Retry clicked!")}},l={args:{variant:"default",title:"Access Denied",message:"You do not have permission to view this content."}},d={args:{variant:"inline",title:"Form Error",message:"Please correct the highlighted fields.",showIcon:!1}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "Failed to load habitats",
    message: "We encountered an error while loading your habitats. Please check your connection and try again.",
    onRetry: () => alert("Retry clicked!")
  }
}`,...a.parameters?.docs?.source},description:{story:"Default error state with full message and retry",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "minimal",
    title: "Upload failed",
    onRetry: () => alert("Retry clicked!")
  }
}`,...n.parameters?.docs?.source},description:{story:"Minimal error state for inline use",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    title: "Network Error",
    message: "Unable to connect to the server. Please check your internet connection.",
    onRetry: () => alert("Retry clicked!")
  }
}`,...s.parameters?.docs?.source},description:{story:"Card-style error for prominent display",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inline",
    title: "Validation Error",
    message: "Please check your input and try again.",
    onRetry: () => alert("Retry clicked!")
  }
}`,...o.parameters?.docs?.source},description:{story:"Inline error for form fields and compact spaces",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "Connection Lost",
    message: "Unable to connect to Zoovie servers.",
    icon: <Wifi className="w-12 h-12 text-destructive" />,
    onRetry: () => alert("Retry clicked!")
  }
}`,...i.parameters?.docs?.source},description:{story:"Error with custom network icon",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    title: "Database Error",
    message: "There was a problem accessing your data.",
    icon: <Database className="w-12 h-12 text-destructive" />,
    onRetry: () => alert("Retry clicked!")
  }
}`,...c.parameters?.docs?.source},description:{story:"Database error with custom icon",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "Access Denied",
    message: "You do not have permission to view this content."
  }
}`,...l.parameters?.docs?.source},description:{story:"Error without retry action",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inline",
    title: "Form Error",
    message: "Please correct the highlighted fields.",
    showIcon: false
  }
}`,...d.parameters?.docs?.source},description:{story:"Error without icon",...d.parameters?.docs?.description}}};const U=["Default","Minimal","Card","Inline","WithCustomIcon","DatabaseError","NoRetry","NoIcon"];export{s as Card,c as DatabaseError,a as Default,o as Inline,n as Minimal,d as NoIcon,l as NoRetry,i as WithCustomIcon,U as __namedExportsOrder,P as default};
