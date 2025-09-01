import{j as e}from"./jsx-runtime-Bg5fjw9X.js";import{c as g}from"./utils-CBfrqCZ4.js";import{c as L,B as v}from"./button-DeCiuNqF.js";import{S as E}from"./search-D-dy8PJ7.js";import"./iframe-BYNQwDXw.js";import"./preload-helper-D9Z9MdNV.js";/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],B=L("users",I);function S({variant:k="default",title:u="No items found",description:a="There are no items to display at the moment.",icon:h,actionLabel:r,onAction:t,secondaryActionLabel:b,onSecondaryAction:x,className:y,showIcon:f=!0}){const w=e.jsx("svg",{className:"w-12 h-12 text-muted-foreground",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"})}),N=()=>!t&&!x?null:e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 justify-center",children:[t&&r&&e.jsx(v,{onClick:t,variant:"default",children:r}),x&&b&&e.jsx(v,{onClick:x,variant:"outline",children:b})]}),j=()=>e.jsx("div",{className:g("empty-state","empty-state-minimal",y),"data-testid":"empty-state",children:e.jsxs("div",{className:"flex items-center gap-2 text-muted-foreground",children:[f&&(h||e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7"})})),e.jsx("span",{className:"text-sm",children:u}),t&&r&&e.jsx(v,{variant:"ghost",size:"sm",onClick:t,className:"h-auto p-1 text-xs",children:r})]})}),C=()=>e.jsx("div",{className:g("empty-state","empty-state-inline",y),"data-testid":"empty-state",children:e.jsxs("div",{className:"flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-lg",children:[f&&(h||e.jsx("svg",{className:"w-6 h-6 text-muted-foreground flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7"})})),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-foreground",children:u}),a&&e.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:a})]}),t&&r&&e.jsx(v,{variant:"outline",size:"sm",onClick:t,className:"flex-shrink-0",children:r})]})}),A=()=>e.jsx("div",{className:g("empty-state","empty-state-card",y),"data-testid":"empty-state",children:e.jsxs("div",{className:"p-6 bg-card border border-border rounded-lg text-center",children:[f&&e.jsx("div",{className:"flex justify-center mb-4",children:h||w}),e.jsx("h3",{className:"text-lg font-semibold text-foreground mb-2",children:u}),a&&e.jsx("p",{className:"text-muted-foreground mb-6 max-w-md mx-auto",children:a}),N()]})}),T=()=>e.jsx("div",{className:g("empty-state","empty-state-default",y),"data-testid":"empty-state",children:e.jsxs("div",{className:"flex flex-col items-center justify-center py-12 px-4 text-center",children:[f&&e.jsx("div",{className:"mb-4",children:h||w}),e.jsx("h3",{className:"text-xl font-semibold text-foreground mb-2",children:u}),a&&e.jsx("p",{className:"text-muted-foreground mb-6 max-w-md",children:a}),N()]})});return(()=>{switch(k){case"minimal":return j();case"inline":return C();case"card":return A();case"default":default:return T()}})()}S.__docgenInfo={description:`EmptyState component provides consistent empty state display with action buttons.

This component handles empty data scenarios with appropriate visual feedback
and user actions. It supports multiple variants for different UI contexts and
provides customizable primary and secondary actions to guide users.

@example
\`\`\`tsx
// Default empty state with action
<EmptyState
  title="No habitats found"
  description="Create your first habitat to get started"
  actionLabel="Create Habitat"
  onAction={handleCreate}
/>

// Minimal empty state
<EmptyState
  variant="minimal"
  title="No messages"
  actionLabel="Send first message"
  onAction={handleSend}
/>

// Card with primary and secondary actions
<EmptyState
  variant="card"
  title="No discussions yet"
  actionLabel="Start Discussion"
  onAction={handleStart}
  secondaryActionLabel="Browse Topics"
  onSecondaryAction={handleBrowse}
/>
\`\`\`

@param props - The component props
@returns An empty state component with optional action buttons`,methods:[],displayName:"EmptyState",props:{variant:{required:!1,tsType:{name:"union",raw:'"default" | "minimal" | "card" | "inline"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"minimal"'},{name:"literal",value:'"card"'},{name:"literal",value:'"inline"'}]},description:"The display variant - affects layout and styling",defaultValue:{value:'"default"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"The empty state title/heading",defaultValue:{value:'"No items found"',computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Descriptive text explaining the empty state",defaultValue:{value:'"There are no items to display at the moment."',computed:!1}},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Custom icon to display (overrides default)"},actionLabel:{required:!1,tsType:{name:"string"},description:"Text for the primary action button"},onAction:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback for the primary action"},secondaryActionLabel:{required:!1,tsType:{name:"string"},description:"Text for the secondary action button"},onSecondaryAction:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback for the secondary action"},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes to apply"},showIcon:{required:!1,tsType:{name:"boolean"},description:"Whether to show the empty state icon",defaultValue:{value:"true",computed:!1}}}};const _={title:"Components/States/EmptyState",component:S,parameters:{layout:"padded",docs:{description:{component:"EmptyState provides consistent empty state display with action buttons to guide users."}}},argTypes:{variant:{control:"select",options:["default","minimal","card","inline"],description:"The display variant"},title:{control:"text",description:"The empty state title/heading"},description:{control:"text",description:"Descriptive text explaining the empty state"},actionLabel:{control:"text",description:"Text for the primary action button"},secondaryActionLabel:{control:"text",description:"Text for the secondary action button"},showIcon:{control:"boolean",description:"Whether to show the empty state icon"}}},n={args:{variant:"default",title:"No habitats found",description:"Create your first habitat to start building your community.",actionLabel:"Create Habitat",onAction:()=>alert("Create habitat clicked!")}},s={args:{variant:"minimal",title:"No messages",actionLabel:"Send message",onAction:()=>alert("Send message clicked!")}},i={args:{variant:"card",title:"No discussions yet",description:"Start the conversation by creating the first discussion topic.",actionLabel:"Start Discussion",onAction:()=>alert("Start discussion clicked!")}},o={args:{variant:"inline",title:"No results found",description:"Try adjusting your search criteria.",actionLabel:"Clear filters",onAction:()=>alert("Clear filters clicked!")}},c={args:{variant:"default",title:"No watch parties scheduled",description:"Create a watch party or browse upcoming events from other habitats.",actionLabel:"Create Watch Party",onAction:()=>alert("Create party clicked!"),secondaryActionLabel:"Browse Events",onSecondaryAction:()=>alert("Browse events clicked!")}},d={args:{variant:"card",title:"No search results",description:"We couldn't find any habitats matching your search.",icon:e.jsx(E,{className:"w-12 h-12 text-muted-foreground"}),actionLabel:"Clear Search",onAction:()=>alert("Clear search clicked!"),secondaryActionLabel:"Browse All",onSecondaryAction:()=>alert("Browse all clicked!")}},l={args:{variant:"default",title:"No members yet",description:"Invite friends to join your habitat and start the conversation.",icon:e.jsx(B,{className:"w-12 h-12 text-muted-foreground"}),actionLabel:"Invite Friends",onAction:()=>alert("Invite friends clicked!")}},m={args:{variant:"card",title:"Coming Soon",description:"This feature is currently in development and will be available soon."}},p={args:{variant:"inline",title:"No notifications",description:"You're all caught up!",showIcon:!1}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "No habitats found",
    description: "Create your first habitat to start building your community.",
    actionLabel: "Create Habitat",
    onAction: () => alert("Create habitat clicked!")
  }
}`,...n.parameters?.docs?.source},description:{story:"Default empty state with primary action",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "minimal",
    title: "No messages",
    actionLabel: "Send message",
    onAction: () => alert("Send message clicked!")
  }
}`,...s.parameters?.docs?.source},description:{story:"Minimal empty state for compact spaces",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    title: "No discussions yet",
    description: "Start the conversation by creating the first discussion topic.",
    actionLabel: "Start Discussion",
    onAction: () => alert("Start discussion clicked!")
  }
}`,...i.parameters?.docs?.source},description:{story:"Card-style empty state",...i.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inline",
    title: "No results found",
    description: "Try adjusting your search criteria.",
    actionLabel: "Clear filters",
    onAction: () => alert("Clear filters clicked!")
  }
}`,...o.parameters?.docs?.source},description:{story:"Inline empty state for lists",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "No watch parties scheduled",
    description: "Create a watch party or browse upcoming events from other habitats.",
    actionLabel: "Create Watch Party",
    onAction: () => alert("Create party clicked!"),
    secondaryActionLabel: "Browse Events",
    onSecondaryAction: () => alert("Browse events clicked!")
  }
}`,...c.parameters?.docs?.source},description:{story:"Empty state with primary and secondary actions",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    title: "No search results",
    description: "We couldn't find any habitats matching your search.",
    icon: <Search className="w-12 h-12 text-muted-foreground" />,
    actionLabel: "Clear Search",
    onAction: () => alert("Clear search clicked!"),
    secondaryActionLabel: "Browse All",
    onSecondaryAction: () => alert("Browse all clicked!")
  }
}`,...d.parameters?.docs?.source},description:{story:"Empty search results with custom icon",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "default",
    title: "No members yet",
    description: "Invite friends to join your habitat and start the conversation.",
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    actionLabel: "Invite Friends",
    onAction: () => alert("Invite friends clicked!")
  }
}`,...l.parameters?.docs?.source},description:{story:"Empty community with custom icon",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "card",
    title: "Coming Soon",
    description: "This feature is currently in development and will be available soon."
  }
}`,...m.parameters?.docs?.source},description:{story:"Empty state without actions",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inline",
    title: "No notifications",
    description: "You're all caught up!",
    showIcon: false
  }
}`,...p.parameters?.docs?.source},description:{story:"Empty state without icon",...p.parameters?.docs?.description}}};const z=["Default","Minimal","Card","Inline","WithSecondaryAction","SearchResults","EmptyCommunity","NoActions","NoIcon"];export{i as Card,n as Default,l as EmptyCommunity,o as Inline,s as Minimal,m as NoActions,p as NoIcon,d as SearchResults,c as WithSecondaryAction,z as __namedExportsOrder,_ as default};
