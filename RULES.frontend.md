
# agents.md

## purpose

this file defines the frontend engineering rules for agents working in this repository.

these rules apply to react, next.js, and react native projects.

the primary goals are:

- maintainability
- clear ownership
- single responsibility
- predictable data flow
- testable code
- consistent architecture
- minimal unnecessary complexity
- small and focused changes
- reuse of existing project patterns

do not apply generic architecture blindly.

the existing repository architecture and conventions always take priority.

---

## 1. inspect before coding

before making any change:

- inspect the relevant feature
- inspect the parent component
- inspect nearby components
- inspect existing hooks
- inspect existing api code
- inspect existing tanstack query code
- inspect existing state management
- inspect existing theme and design tokens
- inspect existing constants
- inspect existing shared utilities
- inspect existing types
- inspect similar tests
- find similar implementations elsewhere in the repository

understand how the existing code works before deciding where new code belongs.

do not invent folders, files, abstractions, or architecture before inspecting the repository.

---

## 2. follow the existing codebase

existing project conventions are more important than generic frontend conventions.

follow the repository's existing patterns for:

- folder structure
- naming
- imports
- component organization
- state management
- api architecture
- query architecture
- styling
- theme
- navigation
- forms
- authentication
- error handling
- testing

if an established pattern already exists, use it.

do not introduce a second architecture inside the same project.

do not reorganize existing code simply because another structure looks cleaner.

---

## 3. feature ownership

feature-specific code should stay inside the feature that owns it.

a feature can look like:

features/
  orders/
    screens/
    components/
    hooks/
    api/
    query/
    utils/
    types/

example:

features/
  orders/
    screens/
      OrderDetailsScreen/
        index.tsx

    components/
      OrderCard/
        index.tsx

    hooks/
      useOrder.ts

    api/
      orderApi.ts

    query/
      keys.ts
      queries.ts
      mutations.ts

    utils/
      calculateOrderTotal.ts

    types/
      order.types.ts

do not scatter one feature across unrelated global folders.

do not put feature-specific code into global folders simply because those folders already exist.

---

## 4. shared code

global/shared folders should contain genuinely shared code.

examples:

shared/
  components/
  hooks/
  utils/
  constants/
  types/

a piece of code should become shared only when it is genuinely shared between independent features.

do not move code into shared because:

- it might be reused in the future
- it is used twice inside the same feature
- the agent thinks all utilities belong in one global folder
- the agent wants to make the folder structure look cleaner

feature-specific code should remain feature-specific.

---

## 5. component folder convention

use the existing folder-based component convention.

for meaningful components use:

OrderCard/
  index.tsx

Profile/
  index.tsx

PostCard/
  index.tsx

do not randomly switch to:

OrderCard.tsx

when the project uses folder-based `index.tsx` components.

when a component becomes complex, it can contain related implementation:

OrderCard/
  index.tsx
  components/
  hooks/
  utils/
  types.ts

the component should normally be imported through its folder.

do not create an unnecessary `index.ts` barrel hierarchy unless the project already uses that pattern.

---

## 6. nested component folders

components may contain components.

this is valid:

PostCard/
  index.tsx
  components/
    PostHeader/
      index.tsx
    PostContent/
      index.tsx
    PostFooter/
      index.tsx
    Comments/
      index.tsx

nested components are useful when they belong specifically to the parent component.

do not flatten all nested components into a global components directory.

ownership should remain obvious from the folder structure.

---

## 7. do not over-componentize

do not create a component for every jsx block.

do not split a component simply because it reaches:

- 100 lines
- 200 lines
- 300 lines
- 500 lines

line count alone is not a reason to extract a component.

a 300-line component with one clear responsibility can be better than ten small components with meaningless boundaries.

do not automatically create:

LikeButton/
DislikeButton/
ShareButton/
Title/
PriceLabel/
PriceValue/

just because these elements exist.

extract a component when it has meaningful:

- responsibility
- state
- behavior
- reuse
- complexity
- lifecycle
- testing boundary

---

## 8. component extraction rule

extract components based on responsibility, not file size.

good reasons to extract:

- separate feature
- independent state
- independent behavior
- meaningful reuse
- complex ui section
- separate lifecycle
- clear ownership
- meaningful testing boundary

bad reason:

"the file is 250 lines, so create five components."

the goal is not to minimize line count.

the goal is to create meaningful boundaries.

---

## 9. example of reasonable decomposition

a post card may contain:

PostCard/
  index.tsx
  components/
    PostHeader/
      index.tsx
    PostContent/
      index.tsx
    PostFooter/
      index.tsx
    Comments/
      index.tsx

PostFooter can contain:

- like
- dislike
- comment
- share

do not automatically create:

LikeButton/
DislikeButton/
ShareButton/

unless those pieces actually have meaningful independent logic, state, reuse, or complexity.

comments may deserve its own component because comments can become a meaningful feature with their own:

- state
- api
- mutations
- loading
- pagination
- validation
- nested components

---

## 10. preserve logical ownership when extracting

when breaking a large component into smaller components, do not blindly move code and create excessive props.

before extraction determine:

- who owns the state
- who owns the action
- who owns the business logic
- who needs the data
- who should trigger the action
- whether the data is server state
- whether the data is local ui state
- whether the logic belongs to the feature hook

component extraction should improve ownership, not make ownership more confusing.

---

## 11. parent-owned actions

if the parent owns an operation, keep ownership in the parent or feature hook.

example:

PostCard receives:

onDelete

the nested component can call:

onDelete(post.id)

but it should not need to know:

- which api is called
- which mutation is used
- how cache invalidation works
- how navigation works
- how the toast is shown
- how errors are handled

the parent or feature layer should own that behavior.

---

## 12. props and prop drilling

do not treat every prop as bad prop drilling.

passing a few props through one or two meaningful component boundaries is completely acceptable.

for example:

<PostFooter
  postId={post.id}
  onDelete={handleDelete}
/>

is fine.

do not introduce context just to avoid passing one or two props.

when deeply nested components genuinely need shared state or actions, consider the existing project architecture:

- feature hook
- context
- feature state
- existing global state solution

do not introduce a new state-sharing system unless there is a real need.

---

## 13. state ownership

always determine where state belongs.

### local ui state

keep local ui state close to the component.

examples:

- modal open/close
- dropdown open/close
- selected tab
- expanded section
- temporary ui state
- animation state

### feature state

feature workflows should belong to the feature.

examples:

- profile editing
- order workflow
- dashboard filters
- feature-specific form state
- permission logic

### server state

server data should use the existing server-state architecture.

examples:

- orders
- users
- products
- notifications
- remote data
- loading
- refetching
- mutations
- cache

### global state

use global state only when genuinely global.

do not make local ui state global.

do not use global state to replace server-state management unnecessarily.

---

## 14. view files

view/component files should primarily be responsible for ui and composition.

prefer:

const Order = () => {
  const {
    order,
    loading,
    handleCancel,
  } = useOrder();

  return (...);
};

the view should primarily:

- consume state
- render ui
- compose components
- connect user actions

avoid putting large amounts of:

- business logic
- api calls
- data transformations
- mutation orchestration
- validation
- complex event handlers
- permission logic

directly into the view.

---

## 15. feature hooks

substantial feature logic should live in a feature-specific hook.

examples:

useProfile.ts
useOrder.ts
useDashboard.ts

example:

Profile/
  index.tsx
  useProfile.ts

Order/
  index.tsx
  useOrder.ts

the hook may contain:

- business logic
- event handlers
- state coordination
- derived values
- mutation orchestration
- validation orchestration
- feature-specific side effects
- data transformation
- feature workflows

do not create vague files such as:

logic.ts
commonLogic.ts
featureLogic.ts
handlers.ts
misc.ts

when the logic clearly belongs to a named feature.

---

## 16. do not create giant hooks

do not move 800 lines from a component into one giant hook simply to make the component smaller.

bad:

Order/
  index.tsx
  useOrder.ts

where `useOrder.ts` contains every possible concern for the entire feature.

if the hook becomes genuinely complex, split responsibilities only when those responsibilities are independent.

for example:

Order/
  index.tsx
  useOrder.ts
  hooks/
    useOrderForm.ts
    useOrderPermissions.ts

do not create hooks just to reduce line count.

---

## 17. local logic is allowed

not every function needs to be extracted.

this is perfectly valid:

const [isOpen, setIsOpen] = useState(false);

const handleOpen = () => {
  setIsOpen(true);
};

do not extract trivial functions merely to make a file smaller.

keep simple ui logic close to the ui.

extract substantial business logic when it becomes:

- complex
- reusable
- business-critical
- independently testable
- clearly owned by the feature

---

## 18. ui logic vs business logic

ui logic can remain close to the component.

examples:

- open modal
- close modal
- change tab
- toggle section
- expand/collapse ui

business logic should live in the feature layer.

examples:

- calculate order total
- validate order
- determine eligibility
- apply discount
- cancel order
- check permissions
- transform server data
- submit transaction

do not put complex business rules directly inside jsx.

---

## 19. api structure

feature-specific api code belongs inside that feature.

preferred:

orders/
  api/
    orderApi.ts

or:

orders/
  api/
    orderApi.ts
    orderActionsApi.ts

reuse the existing api client.

do not create another axios/fetch client if the project already has one.

do not make raw api calls throughout presentation components when an api layer already exists.

the api layer should be responsible for communication with the backend.

business decisions should not be scattered across api functions.

---

## 20. tanstack query structure

when tanstack query is used, keep feature-specific query code inside that feature.

preferred:

orders/
  query/
    keys.ts
    queries.ts
    mutations.ts

responsibilities:

`keys.ts`

- centralized query keys

`queries.ts`

- query definitions
- query-specific configuration
- query functions where appropriate

`mutations.ts`

- mutation definitions
- mutation-specific configuration
- mutation functions where appropriate

do not scatter query keys across components.

do not create random query files in unrelated global folders.

---

## 21. query keys

centralize query keys.

example:

export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
};

do not repeatedly write query keys throughout the application.

do not duplicate the same query-key structure in multiple files.

follow the existing project's query-key conventions if they already exist.

---

## 22. server state vs client state

server state includes:

- api data
- loading
- server errors
- caching
- refetching
- mutations

use the existing server-state solution.

client state includes:

- modal state
- selected tab
- temporary form state
- expanded sections
- local ui state

keep client state local when possible.

do not create global state for data that should be managed by tanstack query.

---

## 23. utilities

before creating a utility:

1. search the repository
2. check existing shared utilities
3. check the current feature
4. reuse existing functionality when possible

feature-specific utility:

features/orders/utils/

genuinely shared utility:

shared/utils/

do not create duplicate utilities.

avoid vague files such as:

helper.ts
common.ts
misc.ts
utils2.ts

prefer names that describe responsibility:

calculateOrderTotal.ts
formatCurrency.ts
validateOrder.ts

---

## 24. global utils vs feature utils

feature business logic should not be moved into global utilities.

bad:

shared/utils/orderBusinessLogic.ts

when only the order feature uses it.

prefer:

features/orders/utils/orderBusinessLogic.ts

global utilities should be generic and independent of a specific feature.

---

## 25. theme and design tokens

never hardcode design values when an existing theme or token exists.

do not write:

color: "#83939d";

if the project already provides the color through:

- theme
- constants
- design tokens
- css variables
- existing styling system

reuse the existing source.

this applies to:

- colors
- typography
- spacing
- border radius
- shadows
- breakpoints
- dimensions
- z-index values
- animation values

if a genuinely new value is required, add it through the existing theme/token system.

do not create random hardcoded values.

---

## 26. reuse existing ui

before creating a new:

- button
- input
- modal
- card
- typography component
- loader
- empty state
- error state
- dropdown
- select
- form component

search the codebase for an existing implementation.

reuse it when appropriate.

do not create visually or functionally duplicate components.

---

## 27. typescript

use strong types.

avoid `any` unless there is a legitimate reason.

avoid unnecessary:

as any

@ts-ignore

@ts-expect-error

do not hide type problems.

reuse existing domain types.

do not create duplicate types representing the same entity.

keep types consistent between:

- api
- query
- hooks
- components
- forms

---

## 28. testable code

important business logic should be testable independently.

prefer pure functions for:

- calculations
- validation
- transformations
- business rules
- complex formatting

pure functions should:

- receive explicit inputs
- return explicit outputs
- avoid unnecessary side effects
- avoid hidden global dependencies

example:

calculateOrderTotal(items, discount)

is easier to test than hiding the same business rule inside a component.

---

## 29. test behavior, not implementation

tests should focus on user-observable behavior.

prefer:

user submits form
→ validation error appears

user presses delete
→ confirmation appears

user confirms
→ item disappears

api fails
→ error state appears

avoid tests heavily coupled to:

- internal state
- setState calls
- implementation-specific functions
- component internals

a refactor should not break tests when the user-facing behavior remains the same.

---

## 30. testing boundaries

use the appropriate testing level.

unit tests:

- calculations
- validation
- transformations
- business rules
- pure utilities

component/integration tests:

- forms
- user interactions
- loading states
- error states
- important feature behavior

e2e tests:

- critical user journeys
- important end-to-end flows

do not write tests only to increase coverage numbers.

test important behavior and business rules.

---

## 31. test ids

prefer user-facing or accessibility-based queries in tests.

use test ids only when an appropriate user-facing query is not practical.

do not add test ids everywhere just because they are convenient.

---

## 32. accessibility

consider accessibility for every user-facing feature.

use:

- meaningful accessible labels
- correct roles
- keyboard interaction on web
- focus management
- disabled states
- useful error messages
- semantic html where applicable
- react native accessibility properties where applicable

do not sacrifice accessibility for convenience.

---

## 33. forms

follow the existing form architecture.

complex forms should not contain everything inside one view.

separate when necessary:

- ui
- form state
- validation
- business logic
- mutation
- api

reuse existing:

- form components
- validation utilities
- schemas
- hooks
- error handling

do not introduce a new form library when the project already has an established solution.

---

## 34. side effects

side effects need a clear owner.

examples:

- api calls
- subscriptions
- event listeners
- timers
- storage synchronization
- analytics
- navigation effects

do not scatter unrelated side effects across components.

do not use `useEffect` for values that can be calculated directly.

do not use an effect when an event handler is the correct solution.

---

## 35. performance

do not blindly add:

- useMemo
- useCallback
- React.memo

optimization should have a reason.

prefer:

- correct state ownership
- appropriate component boundaries
- efficient lists
- stable keys
- proper query caching
- avoiding unnecessary calculations
- avoiding unnecessary network requests

do not optimize imaginary problems.

---

## 36. lists

for large lists:

- use the appropriate virtualization/list solution
- use stable keys
- avoid expensive calculations during render
- avoid unnecessary transformations
- keep item components reasonably focused
- follow the existing project list architecture

for react native, follow the existing `FlatList`, `SectionList`, `FlashList`, or other established list implementation.

do not replace list technology without a reason.

---

## 37. next.js

when working with next.js:

- respect the existing app router or pages router architecture
- do not add `"use client"` unless client behavior is required
- keep server-only logic on the server
- keep client boundaries intentional
- reuse existing data-fetching patterns
- do not move server logic into client components unnecessarily

---

## 38. react native

when working with react native:

- follow the existing navigation architecture
- reuse existing native modules
- follow existing platform-specific patterns
- avoid unnecessary native dependencies
- keep business logic separate from ui/native implementation when appropriate
- reuse existing native utilities
- do not introduce a new native library when existing functionality already solves the requirement

---

## 39. no premature abstraction

do not create abstractions just because they sound architectural.

avoid creating:

GenericCard/
BaseComponent/
UniversalModal/
GenericApiService/
GenericFeatureHook/
UniversalForm/

unless there is a real requirement.

do not design for hypothetical future requirements.

real duplication or real complexity should drive abstraction.

---

## 40. no premature globalisation

do not move everything into:

shared/
utils/
hooks/
components/

just because it might be reusable later.

keep code local until there is a genuine shared requirement.

---

## 41. no duplicate logic

before implementing logic:

- search the repository
- find existing behavior
- reuse it
- extend it when appropriate

do not create a second implementation of an existing rule.

this applies to:

- validation
- formatting
- api calls
- query keys
- calculations
- permissions
- navigation
- theme values
- components

---

## 42. no unrelated refactoring

when implementing a task:

- change only what is necessary
- do not rename unrelated files
- do not reorganize unrelated folders
- do not rewrite unrelated components
- do not migrate libraries
- do not change state management
- do not change styling architecture
- do not upgrade dependencies without a requirement

do not turn a small feature request into a repository-wide refactor.

---

## 43. keep changes focused

if the task is:

"add delete functionality"

do not automatically:

- rewrite the card
- rename components
- change the theme
- migrate state management
- rewrite the api layer
- reorganize folders
- replace libraries

unless those changes are actually required.

implement the requested behavior with the smallest clean architectural change.

---

## 44. prevent complexity growth

when modifying an existing large component, do not keep blindly adding code.

before adding substantial logic:

1. determine which responsibility it belongs to
2. check whether that responsibility already has a module
3. place the logic in the correct layer
4. extract only when there is a meaningful boundary

do not ignore growing complexity because refactoring feels inconvenient.

also do not perform a large speculative refactor when a small safe change is enough.

---

## 45. large existing components

if an existing component is already 500–1000 lines:

do not automatically rewrite it.

when modifying it:

1. understand the existing responsibilities
2. identify the responsibility related to the current task
3. keep new logic in the correct owner
4. extract only the relevant responsibility if necessary
5. avoid unrelated cleanup

if the component clearly contains multiple independent responsibilities, extraction can be done incrementally.

do not make the current task dependent on a massive refactor unless necessary.

---

## 46. incremental refactoring

when a component genuinely needs refactoring, prefer incremental extraction.

example:

step 1:

extract a complex comments section.

step 2:

move substantial feature logic into `usePost.ts`.

step 3:

extract a genuinely reusable utility.

step 4:

leave the remaining ui together if it still has one clear responsibility.

do not rewrite the entire feature just because one section is messy.

---

## 47. avoid excessive prop interfaces

do not create a component that requires a huge list of unrelated props because the component boundary was poorly chosen.

if a component requires many unrelated values, reconsider:

- component ownership
- feature hook
- domain object
- context
- state ownership

however, do not over-engineer this.

normal, clear props are preferred when the boundary is meaningful.

---

## 48. avoid excessive nesting

nested folders are allowed when they represent real ownership.

do not create deep folder structures merely to make the architecture look sophisticated.

the structure should help an engineer find code quickly.

---

## 49. avoid random generated architecture

do not automatically create folders such as:

- constants
- config
- services
- repositories
- adapters
- managers
- providers
- facades
- helpers
- common

unless the repository actually needs them and already follows that architectural style.

do not generate architecture for architecture's sake.

---

## 50. do not increase code unnecessarily

when implementing a feature, prefer the smallest clean implementation.

do not turn a 150-line change into 700–1000 lines without a real requirement.

do not add unnecessary:

- wrappers
- abstractions
- types
- helpers
- state
- effects
- components
- comments
- dependencies
- folders
- files

code should grow because functionality requires it.

---

## 51. preserve existing behavior

when modifying existing code:

- understand existing behavior first
- do not accidentally remove functionality
- preserve existing api contracts
- preserve existing navigation behavior
- preserve existing loading states
- preserve existing error states
- preserve existing styling unless the task requires changes

---

## 52. error handling

follow existing error-handling conventions.

consider relevant states:

- loading
- success
- empty
- error
- retry
- disabled
- validation

do not duplicate error handling across multiple layers when one layer should own it.

---

## 53. security

never hardcode or expose:

- secrets
- private keys
- credentials
- tokens
- sensitive configuration

do not log sensitive user information.

do not assume frontend validation provides security.

follow the existing authentication and authorization architecture.

---

## 54. dependency direction

prefer predictable dependency direction:

ui
↓
feature logic
↓
query/state
↓
api
↓
backend

avoid circular dependencies.

lower-level modules should not depend on high-level ui modules.

do not create dependencies that make the architecture difficult to reason about.

---

## 55. component public boundaries

if a component has internal implementation:

OrderCard/
  index.tsx
  components/
  hooks/

other features should normally import:

import OrderCard from ".../OrderCard";

instead of reaching into:

import Something from ".../OrderCard/components/Something";

unless that internal component is intentionally public.

---

## 56. comments

do not add comments explaining obvious code.

comments should explain:

- why something is necessary
- unusual business rules
- non-obvious constraints
- workarounds
- important architectural decisions

prefer clear naming and structure over excessive comments.

---

## 57. naming

use names that describe responsibility.

good:

useOrder.ts
useProfile.ts
calculateOrderTotal.ts
formatCurrency.ts
OrderCard/
Comments/
PriceBreakdown/

avoid vague names:

helper.ts
common.ts
misc.ts
logic.ts
data.ts
temp.ts
utils2.ts

---

## 58. before creating a file

ask:

1. does this already exist?
2. can an existing component solve this?
3. can an existing hook solve this?
4. can an existing utility solve this?
5. which feature owns this responsibility?
6. is this genuinely shared?
7. does this need independent state?
8. does this need its own api?
9. does this need its own query?
10. will this create unnecessary fragmentation?

only create a file when it has a clear responsibility.

---

## 59. before extracting a component

ask:

1. does this have an independent responsibility?
2. does it have independent state?
3. does it have meaningful reuse?
4. does extraction make ownership clearer?
5. does extraction make testing easier?
6. does extraction reduce meaningful complexity?
7. will extraction create unnecessary prop drilling?
8. is the extracted component actually meaningful?

if most answers are no, keep the code together.

---

## 60. before extracting logic

ask:

1. is this business logic?
2. is it substantial?
3. does the parent own it?
4. can it belong in the feature hook?
5. is it reusable?
6. can it be tested independently?
7. will extracting it create excessive parameters?
8. would a small local function be enough?

do not extract logic merely to make a component shorter.

---

## 61. agent workflow

for every task:

### step 1

inspect the repository.

### step 2

identify the feature owner.

### step 3

find existing patterns.

### step 4

identify state ownership.

### step 5

identify the correct layer:

- ui
- component
- feature hook
- query
- api
- utility
- shared code

### step 6

make the smallest clean change.

### step 7

reuse existing infrastructure.

### step 8

run available:

- type checking
- linting
- tests
- build

when appropriate.

### step 9

review the diff.

### step 10

remove unnecessary:

- files
- folders
- imports
- abstractions
- duplicate code

---

## 62. final review checklist

before finishing a task verify:

- existing architecture is followed
- correct feature owns the code
- folder-based `index.tsx` convention is followed
- responsibilities are clear
- view files remain reasonably declarative
- business logic is not unnecessarily inside the view
- feature logic is in the appropriate hook
- api logic is in the api layer
- tanstack query logic is in the query layer
- query keys are centralized
- server state and ui state are separated
- existing components are reused
- existing hooks are reused
- existing utilities are reused
- existing types are reused
- existing theme tokens are reused
- no hardcoded theme values were introduced
- no duplicate logic was created
- no unnecessary components were created
- no unnecessary folders were created
- no unnecessary abstractions were created
- no unnecessary global state was introduced
- no unnecessary prop drilling was introduced
- no giant hook was created just to reduce component lines
- important business logic is testable
- tests focus on behavior
- accessibility was considered
- no unnecessary dependencies were added
- no unrelated files were changed
- no unrelated refactoring was performed
- type errors were not hidden
- the final diff contains only necessary changes

---

## core principles

follow these principles above everything else:

existing architecture > personal preference

clear responsibility > arbitrary file size

meaningful components > maximum component count

feature-local logic > unnecessary global logic

clear ownership > unnecessary prop drilling

existing abstractions > new abstractions

theme tokens > hardcoded values

testable behavior > implementation-detail tests

simple code > premature abstraction

focused changes > unrelated refactoring

real complexity > arbitrary extraction

consistency > generic architecture

functionality-required code > boilerplate

the goal is not:

- make every file small
- create as many components as possible
- create as many folders as possible
- move every function into a hook
- make everything reusable
- make everything global
- maximize abstraction

the goal is:

- clear ownership
- single responsibility
- predictable data flow
- appropriate component boundaries
- testable business logic
- consistent architecture
- minimal unnecessary complexity
- focused changes

when uncertain:

1. inspect the repository
2. find the closest existing pattern
3. follow that pattern
4. identify ownership
5. make the smallest clean change
6. avoid speculative architecture
7. review the final diff

