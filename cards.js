const CARDS = [
  // Ownership
  { id: 1, category: "Ownership", front: "What is ownership in Rust?", back: "Every value has exactly one owner. When the owner goes out of scope, the value is dropped. No GC needed — memory is freed deterministically." },
  { id: 2, category: "Ownership", front: "What happens when you assign one variable to another in Rust?", back: "For heap types (like String), the value is *moved* — the original variable becomes invalid. For Copy types (like i32), the value is copied." },
  { id: 3, category: "Ownership", front: "What does the Copy trait mean?", back: "Types that implement Copy are duplicated on assignment instead of moved. Primitives like i32, f64, bool, char, and tuples of Copy types are Copy." },
  { id: 4, category: "Ownership", front: "What is the Drop trait?", back: "Drop lets you run custom cleanup code when a value goes out of scope. Rust calls drop() automatically — you can't call it manually (use std::mem::drop() instead)." },
  { id: 5, category: "Ownership", front: "What does std::mem::drop() do?", back: "Forces a value to be dropped (and its memory freed) before the end of its scope. Useful for releasing locks or file handles early." },

  // Borrowing
  { id: 6, category: "Borrowing", front: "What is a shared reference in Rust?", back: "&T — an immutable borrow. You can have any number of shared references to a value at the same time. No mutation allowed through &T." },
  { id: 7, category: "Borrowing", front: "What is a mutable reference in Rust?", back: "&mut T — exclusive, mutable borrow. Only ONE mutable reference can exist at a time, and no shared references can coexist with it." },
  { id: 8, category: "Borrowing", front: "What is the borrow checker?", back: "A compile-time analysis that enforces ownership and borrowing rules, preventing data races, dangling pointers, and use-after-free bugs." },
  { id: 9, category: "Borrowing", front: "What is a dangling reference?", back: "A reference to memory that has already been freed. Rust's borrow checker prevents these at compile time — references always outlive their referents." },
  { id: 10, category: "Borrowing", front: "Can you mutate data through a shared reference?", back: "Not normally. Interior mutability types like RefCell<T>, Mutex<T>, and Cell<T> allow mutation through &T by enforcing borrow rules at runtime instead of compile time." },

  // Lifetimes
  { id: 11, category: "Lifetimes", front: "What is a lifetime in Rust?", back: "A named scope that describes how long a reference is valid. Lifetimes prevent dangling references. Most are inferred; you annotate them when the compiler can't." },
  { id: 12, category: "Lifetimes", front: "What does 'a mean in fn foo<'a>(x: &'a str) -> &'a str?", back: "'a is a lifetime parameter. It says: the returned reference lives at least as long as the input reference. The actual lifetime is inferred at each call site." },
  { id: 13, category: "Lifetimes", front: "What is lifetime elision?", back: "Rules that let the compiler infer lifetime annotations in common patterns so you don't have to write them. E.g., fn first(s: &str) -> &str is OK without explicit 'a." },
  { id: 14, category: "Lifetimes", front: "What is 'static lifetime?", back: "A reference that lives for the entire program duration. String literals (&str) are 'static. Use sparingly — it's a strong promise." },

  // Structs & Enums
  { id: 15, category: "Structs & Enums", front: "How do you define a struct in Rust?", back: "struct Point { x: f64, y: f64 }\n\nInstantiate with: let p = Point { x: 1.0, y: 2.0 };\nAccess fields with dot notation: p.x" },
  { id: 16, category: "Structs & Enums", front: "What is a tuple struct?", back: "struct Meters(f64);\n\nA struct with unnamed positional fields. Access with .0, .1, etc. Useful for newtype wrappers." },
  { id: 17, category: "Structs & Enums", front: "How do you define an enum in Rust?", back: "enum Direction { North, South, East, West }\n\nEnums can also carry data: enum Shape { Circle(f64), Rect(f64, f64) }" },
  { id: 18, category: "Structs & Enums", front: "What is Option<T>?", back: "enum Option<T> { Some(T), None }\n\nRust's null-safe type. Instead of null, you get None. Forces you to handle the missing-value case explicitly." },
  { id: 19, category: "Structs & Enums", front: "What is Result<T, E>?", back: "enum Result<T, E> { Ok(T), Err(E) }\n\nUsed for fallible operations. Forces callers to handle errors. The ? operator propagates Err automatically." },
  { id: 20, category: "Structs & Enums", front: "What is the #[derive] attribute?", back: "Auto-implements traits. Common: #[derive(Debug, Clone, PartialEq)]. Debug enables {:?} formatting, Clone enables .clone(), PartialEq enables == and !=." },

  // Pattern Matching
  { id: 21, category: "Pattern Matching", front: "What does match do in Rust?", back: "match value { pattern1 => expr1, pattern2 => expr2, _ => fallback }\n\nExhaustive — every possible value must be covered. The _ arm is a catch-all." },
  { id: 22, category: "Pattern Matching", front: "What is if let?", back: "if let Some(x) = maybe_value { use(x) }\n\nSyntactic sugar for a match with one arm. Cleaner than match when you only care about one pattern." },
  { id: 23, category: "Pattern Matching", front: "What is while let?", back: "while let Some(val) = stack.pop() { process(val) }\n\nLoops as long as a pattern matches. Useful for consuming iterators or stacks." },
  { id: 24, category: "Pattern Matching", front: "What are match guards?", back: "Extra conditions on match arms: match x { n if n < 0 => \"negative\", n if n == 0 => \"zero\", _ => \"positive\" }" },
  { id: 25, category: "Pattern Matching", front: "How do you destructure a struct in a match?", back: "let Point { x, y } = p;\nmatch p { Point { x: 0, y } => println!(\"on y-axis at {y}\"), Point { x, y } => println!(\"{x},{y}\") }" },

  // Traits
  { id: 26, category: "Traits", front: "What is a trait in Rust?", back: "A collection of method signatures (and optional default implementations) that types can implement. Similar to interfaces in other languages." },
  { id: 27, category: "Traits", front: "How do you implement a trait?", back: "impl Display for MyType { fn fmt(&self, f: &mut Formatter) -> fmt::Result { write!(f, \"...\") } }\n\nEach method in the trait must be implemented (unless it has a default)." },
  { id: 28, category: "Traits", front: "What is a trait bound?", back: "fn print<T: Display>(val: T) — constrains a generic T to types that implement Display. Multiple bounds: T: Display + Clone. Cleaner with where: where T: Display + Clone." },
  { id: 29, category: "Traits", front: "What is a trait object?", back: "dyn Trait — a pointer to a value whose concrete type isn't known at compile time. Box<dyn Trait> is heap-allocated dynamic dispatch. Has runtime overhead vs generics." },
  { id: 30, category: "Traits", front: "What is the Deref trait?", back: "Allows *v to work on custom types. Smart pointers like Box<T>, Rc<T>, and Arc<T> implement Deref so they can be used like regular references." },
  { id: 31, category: "Traits", front: "What is the Iterator trait?", back: "trait Iterator { type Item; fn next(&mut self) -> Option<Self::Item>; }\n\nImplement next() and you get map, filter, collect, zip, enumerate, etc. for free." },

  // Generics
  { id: 32, category: "Generics", front: "What is a generic function?", back: "fn largest<T: PartialOrd>(list: &[T]) -> &T — works for any T that implements PartialOrd. Monomorphized at compile time: no runtime cost." },
  { id: 33, category: "Generics", front: "What is monomorphization?", back: "The compiler generates a separate copy of generic code for each concrete type used. Results in fast, specialized code with zero runtime overhead." },
  { id: 34, category: "Generics", front: "What is a generic struct?", back: "struct Stack<T> { items: Vec<T> }\nimpl<T> Stack<T> { fn push(&mut self, item: T) { self.items.push(item); } }" },
  { id: 35, category: "Generics", front: "When would you use trait objects (dyn) over generics?", back: "When you need a heterogeneous collection (Vec<Box<dyn Animal>>), or when the concrete type isn't known until runtime. Generics are preferred when possible for performance." },

  // Error Handling
  { id: 36, category: "Error Handling", front: "What does the ? operator do?", back: "Unwraps Ok(val) to val, or returns Err(e) early from the current function. Only works in functions returning Result or Option. Much cleaner than match for error propagation." },
  { id: 37, category: "Error Handling", front: "What is unwrap()?", back: "Extracts the value from Some/Ok, or panics if it's None/Err. Fine for prototyping or cases that truly can't fail. Avoid in production — use ? or proper error handling." },
  { id: 38, category: "Error Handling", front: "What is expect()?", back: "Like unwrap() but with a custom panic message: file.open().expect(\"failed to open config\"). Better than unwrap for debugging." },
  { id: 39, category: "Error Handling", front: "How do you define a custom error type?", back: "#[derive(Debug)]\nenum AppError { IoError(std::io::Error), ParseError(String) }\nimpl std::error::Error for AppError {}\nimpl Display for AppError { ... }" },
  { id: 40, category: "Error Handling", front: "What is the anyhow crate for?", back: "Easy error handling in applications. anyhow::Result<T> wraps any error type. Use ? freely and add context with .context(\"doing X\"). Great for app code, not library code." },

  // Closures & Iterators
  { id: 41, category: "Closures & Iterators", front: "What is a closure in Rust?", back: "An anonymous function that captures variables from its environment. |x| x * 2 — the compiler infers parameter and return types. Closures implement Fn, FnMut, or FnOnce." },
  { id: 42, category: "Closures & Iterators", front: "What is the difference between Fn, FnMut, and FnOnce?", back: "FnOnce: can be called once (consumes captured vars). FnMut: can be called multiple times, mutates captured vars. Fn: can be called multiple times, immutable captures." },
  { id: 43, category: "Closures & Iterators", front: "What does move do in a closure?", back: "move |x| x + y forces the closure to take ownership of captured variables. Required when the closure outlives the scope where it's created (e.g., threads)." },
  { id: 44, category: "Closures & Iterators", front: "What is an iterator adapter?", back: "Methods like .map(), .filter(), .take(), .zip() that return new iterators. They're lazy — nothing runs until you call a consuming adapter like .collect() or .for_each()." },
  { id: 45, category: "Closures & Iterators", front: "What does .collect() do?", back: "Consumes an iterator and gathers results into a collection. The target type must be specified: let v: Vec<i32> = iter.collect(); or iter.collect::<Vec<_>>()" },

  // Concurrency
  { id: 46, category: "Concurrency", front: "How do you spawn a thread in Rust?", back: "let handle = std::thread::spawn(|| { /* work */ });\nhandle.join().unwrap(); // wait for it\nUse move closures to transfer ownership into the thread." },
  { id: 47, category: "Concurrency", front: "What is Arc<T>?", back: "Atomically Reference Counted smart pointer. Like Rc<T> but safe to share across threads. Clone it to share ownership; value is dropped when the last Arc is dropped." },
  { id: 48, category: "Concurrency", front: "What is Mutex<T>?", back: "Mutual exclusion lock. let m = Mutex::new(0); let mut val = m.lock().unwrap(); *val += 1;\nThe lock is released when the MutexGuard goes out of scope." },
  { id: 49, category: "Concurrency", front: "What are channels in Rust?", back: "let (tx, rx) = std::sync::mpsc::channel();\ntx.send(42).unwrap();\nlet val = rx.recv().unwrap();\nmulti-producer, single-consumer. Use Arc<Mutex> for shared state instead when needed." },
  { id: 50, category: "Concurrency", front: "What do the Send and Sync traits mean?", back: "Send: safe to transfer ownership to another thread. Sync: safe to share a reference across threads (&T is Send if T: Sync). Most types are automatically Send + Sync." },

  // Async
  { id: 51, category: "Async", front: "What is async/await in Rust?", back: "async fn returns a Future. Futures are lazy — they do nothing until awaited. await drives the future to completion. Requires an async runtime like tokio or async-std." },
  { id: 52, category: "Async", front: "What is a Future in Rust?", back: "A value representing a computation that hasn't completed yet. Implementing Future requires a poll() method. Usually you use async/await and let the compiler generate it." },
  { id: 53, category: "Async", front: "What is tokio?", back: "The most popular async runtime for Rust. Add #[tokio::main] to your main fn to run async code. Provides async I/O, timers, tasks, channels, and more." },
  { id: 54, category: "Async", front: "What is tokio::spawn?", back: "Spawns an async task onto the tokio runtime (like a lightweight thread). Returns a JoinHandle you can await. The task must be 'static + Send." },

  // String Types
  { id: 55, category: "Types", front: "What is the difference between String and &str?", back: "String: owned, heap-allocated, growable. &str: borrowed reference to string data (could be in static memory or inside a String). Functions usually take &str for flexibility." },
  { id: 56, category: "Types", front: "How do you convert between String and &str?", back: "String → &str: &my_string or my_string.as_str()\n&str → String: my_str.to_string() or my_str.to_owned() or String::from(my_str)" },
  { id: 57, category: "Types", front: "What is a Vec<T>?", back: "A heap-allocated growable array. Vec::new(), vec![1,2,3], .push(), .pop(), .len(), .iter(). Derefs to &[T] — slice methods work on Vec." },
  { id: 58, category: "Types", front: "What is HashMap<K, V>?", back: "use std::collections::HashMap;\nlet mut map = HashMap::new();\nmap.insert(\"key\", 42);\nmap.get(\"key\") returns Option<&V>.\nmap.entry(k).or_insert(v) is the idiomatic upsert pattern." },
  { id: 59, category: "Types", front: "What is a slice (&[T])?", back: "A view into a contiguous sequence of T. &[1,2,3], or &v[1..3] for a sub-slice. Doesn't own data. Most sequence-processing functions take slices for generality." },

  // Cargo & Modules
  { id: 60, category: "Cargo & Modules", front: "What is Cargo?", back: "Rust's build system and package manager. cargo new creates projects, cargo build compiles, cargo test runs tests, cargo doc generates docs, cargo add adds dependencies." },
  { id: 61, category: "Cargo & Modules", front: "What is Cargo.toml?", back: "The project manifest. Declares the package name, version, edition, and dependencies. [dependencies] lists crates from crates.io. [dev-dependencies] are test-only deps." },
  { id: 62, category: "Cargo & Modules", front: "What is a crate?", back: "The smallest compilation unit in Rust. A binary crate has main.rs; a library crate has lib.rs. A package (Cargo project) can contain multiple crates." },
  { id: 63, category: "Cargo & Modules", front: "What is a module (mod)?", back: "mod utils { pub fn helper() {} }\nModules organize code within a crate. pub makes items public. Use use to bring items into scope: use crate::utils::helper;" },
  { id: 64, category: "Cargo & Modules", front: "What does pub(crate) mean?", back: "Visible anywhere within the current crate, but not to external consumers. More restrictive than pub, more permissive than private. Good for internal APIs." },
  { id: 65, category: "Cargo & Modules", front: "What is cargo clippy?", back: "A linter that catches common mistakes, non-idiomatic code, and performance issues. Run it before committing. cargo fix can auto-apply many suggestions." },
];
