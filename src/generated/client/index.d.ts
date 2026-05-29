
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Admin
 * 
 */
export type Admin = $Result.DefaultSelection<Prisma.$AdminPayload>
/**
 * Model Member
 * 
 */
export type Member = $Result.DefaultSelection<Prisma.$MemberPayload>
/**
 * Model Sport
 * 
 */
export type Sport = $Result.DefaultSelection<Prisma.$SportPayload>
/**
 * Model Turf
 * 
 */
export type Turf = $Result.DefaultSelection<Prisma.$TurfPayload>
/**
 * Model TurfSport
 * 
 */
export type TurfSport = $Result.DefaultSelection<Prisma.$TurfSportPayload>
/**
 * Model MembershipPlan
 * 
 */
export type MembershipPlan = $Result.DefaultSelection<Prisma.$MembershipPlanPayload>
/**
 * Model MemberMembership
 * 
 */
export type MemberMembership = $Result.DefaultSelection<Prisma.$MemberMembershipPayload>
/**
 * Model Attendance
 * 
 */
export type Attendance = $Result.DefaultSelection<Prisma.$AttendancePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Admins
 * const admins = await prisma.admin.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Admins
   * const admins = await prisma.admin.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.admin`: Exposes CRUD operations for the **Admin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Admins
    * const admins = await prisma.admin.findMany()
    * ```
    */
  get admin(): Prisma.AdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.member`: Exposes CRUD operations for the **Member** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Members
    * const members = await prisma.member.findMany()
    * ```
    */
  get member(): Prisma.MemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sport`: Exposes CRUD operations for the **Sport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sports
    * const sports = await prisma.sport.findMany()
    * ```
    */
  get sport(): Prisma.SportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.turf`: Exposes CRUD operations for the **Turf** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Turfs
    * const turfs = await prisma.turf.findMany()
    * ```
    */
  get turf(): Prisma.TurfDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.turfSport`: Exposes CRUD operations for the **TurfSport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TurfSports
    * const turfSports = await prisma.turfSport.findMany()
    * ```
    */
  get turfSport(): Prisma.TurfSportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.membershipPlan`: Exposes CRUD operations for the **MembershipPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MembershipPlans
    * const membershipPlans = await prisma.membershipPlan.findMany()
    * ```
    */
  get membershipPlan(): Prisma.MembershipPlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memberMembership`: Exposes CRUD operations for the **MemberMembership** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemberMemberships
    * const memberMemberships = await prisma.memberMembership.findMany()
    * ```
    */
  get memberMembership(): Prisma.MemberMembershipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attendance`: Exposes CRUD operations for the **Attendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attendances
    * const attendances = await prisma.attendance.findMany()
    * ```
    */
  get attendance(): Prisma.AttendanceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Admin: 'Admin',
    Member: 'Member',
    Sport: 'Sport',
    Turf: 'Turf',
    TurfSport: 'TurfSport',
    MembershipPlan: 'MembershipPlan',
    MemberMembership: 'MemberMembership',
    Attendance: 'Attendance'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "admin" | "member" | "sport" | "turf" | "turfSport" | "membershipPlan" | "memberMembership" | "attendance"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Admin: {
        payload: Prisma.$AdminPayload<ExtArgs>
        fields: Prisma.AdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findFirst: {
            args: Prisma.AdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findMany: {
            args: Prisma.AdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          create: {
            args: Prisma.AdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          createMany: {
            args: Prisma.AdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          delete: {
            args: Prisma.AdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          update: {
            args: Prisma.AdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          deleteMany: {
            args: Prisma.AdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          upsert: {
            args: Prisma.AdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          aggregate: {
            args: Prisma.AdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmin>
          }
          groupBy: {
            args: Prisma.AdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminCountArgs<ExtArgs>
            result: $Utils.Optional<AdminCountAggregateOutputType> | number
          }
        }
      }
      Member: {
        payload: Prisma.$MemberPayload<ExtArgs>
        fields: Prisma.MemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          findFirst: {
            args: Prisma.MemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          findMany: {
            args: Prisma.MemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          create: {
            args: Prisma.MemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          createMany: {
            args: Prisma.MemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          delete: {
            args: Prisma.MemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          update: {
            args: Prisma.MemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          deleteMany: {
            args: Prisma.MemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          upsert: {
            args: Prisma.MemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          aggregate: {
            args: Prisma.MemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMember>
          }
          groupBy: {
            args: Prisma.MemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemberCountArgs<ExtArgs>
            result: $Utils.Optional<MemberCountAggregateOutputType> | number
          }
        }
      }
      Sport: {
        payload: Prisma.$SportPayload<ExtArgs>
        fields: Prisma.SportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          findFirst: {
            args: Prisma.SportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          findMany: {
            args: Prisma.SportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>[]
          }
          create: {
            args: Prisma.SportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          createMany: {
            args: Prisma.SportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>[]
          }
          delete: {
            args: Prisma.SportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          update: {
            args: Prisma.SportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          deleteMany: {
            args: Prisma.SportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>[]
          }
          upsert: {
            args: Prisma.SportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SportPayload>
          }
          aggregate: {
            args: Prisma.SportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSport>
          }
          groupBy: {
            args: Prisma.SportGroupByArgs<ExtArgs>
            result: $Utils.Optional<SportGroupByOutputType>[]
          }
          count: {
            args: Prisma.SportCountArgs<ExtArgs>
            result: $Utils.Optional<SportCountAggregateOutputType> | number
          }
        }
      }
      Turf: {
        payload: Prisma.$TurfPayload<ExtArgs>
        fields: Prisma.TurfFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TurfFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TurfFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          findFirst: {
            args: Prisma.TurfFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TurfFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          findMany: {
            args: Prisma.TurfFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>[]
          }
          create: {
            args: Prisma.TurfCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          createMany: {
            args: Prisma.TurfCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TurfCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>[]
          }
          delete: {
            args: Prisma.TurfDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          update: {
            args: Prisma.TurfUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          deleteMany: {
            args: Prisma.TurfDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TurfUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TurfUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>[]
          }
          upsert: {
            args: Prisma.TurfUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfPayload>
          }
          aggregate: {
            args: Prisma.TurfAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTurf>
          }
          groupBy: {
            args: Prisma.TurfGroupByArgs<ExtArgs>
            result: $Utils.Optional<TurfGroupByOutputType>[]
          }
          count: {
            args: Prisma.TurfCountArgs<ExtArgs>
            result: $Utils.Optional<TurfCountAggregateOutputType> | number
          }
        }
      }
      TurfSport: {
        payload: Prisma.$TurfSportPayload<ExtArgs>
        fields: Prisma.TurfSportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TurfSportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TurfSportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          findFirst: {
            args: Prisma.TurfSportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TurfSportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          findMany: {
            args: Prisma.TurfSportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>[]
          }
          create: {
            args: Prisma.TurfSportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          createMany: {
            args: Prisma.TurfSportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TurfSportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>[]
          }
          delete: {
            args: Prisma.TurfSportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          update: {
            args: Prisma.TurfSportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          deleteMany: {
            args: Prisma.TurfSportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TurfSportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TurfSportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>[]
          }
          upsert: {
            args: Prisma.TurfSportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TurfSportPayload>
          }
          aggregate: {
            args: Prisma.TurfSportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTurfSport>
          }
          groupBy: {
            args: Prisma.TurfSportGroupByArgs<ExtArgs>
            result: $Utils.Optional<TurfSportGroupByOutputType>[]
          }
          count: {
            args: Prisma.TurfSportCountArgs<ExtArgs>
            result: $Utils.Optional<TurfSportCountAggregateOutputType> | number
          }
        }
      }
      MembershipPlan: {
        payload: Prisma.$MembershipPlanPayload<ExtArgs>
        fields: Prisma.MembershipPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MembershipPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MembershipPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          findFirst: {
            args: Prisma.MembershipPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MembershipPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          findMany: {
            args: Prisma.MembershipPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          create: {
            args: Prisma.MembershipPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          createMany: {
            args: Prisma.MembershipPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MembershipPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          delete: {
            args: Prisma.MembershipPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          update: {
            args: Prisma.MembershipPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          deleteMany: {
            args: Prisma.MembershipPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MembershipPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MembershipPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          upsert: {
            args: Prisma.MembershipPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          aggregate: {
            args: Prisma.MembershipPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMembershipPlan>
          }
          groupBy: {
            args: Prisma.MembershipPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<MembershipPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.MembershipPlanCountArgs<ExtArgs>
            result: $Utils.Optional<MembershipPlanCountAggregateOutputType> | number
          }
        }
      }
      MemberMembership: {
        payload: Prisma.$MemberMembershipPayload<ExtArgs>
        fields: Prisma.MemberMembershipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemberMembershipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemberMembershipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          findFirst: {
            args: Prisma.MemberMembershipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemberMembershipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          findMany: {
            args: Prisma.MemberMembershipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>[]
          }
          create: {
            args: Prisma.MemberMembershipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          createMany: {
            args: Prisma.MemberMembershipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemberMembershipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>[]
          }
          delete: {
            args: Prisma.MemberMembershipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          update: {
            args: Prisma.MemberMembershipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          deleteMany: {
            args: Prisma.MemberMembershipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemberMembershipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemberMembershipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>[]
          }
          upsert: {
            args: Prisma.MemberMembershipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberMembershipPayload>
          }
          aggregate: {
            args: Prisma.MemberMembershipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemberMembership>
          }
          groupBy: {
            args: Prisma.MemberMembershipGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemberMembershipGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemberMembershipCountArgs<ExtArgs>
            result: $Utils.Optional<MemberMembershipCountAggregateOutputType> | number
          }
        }
      }
      Attendance: {
        payload: Prisma.$AttendancePayload<ExtArgs>
        fields: Prisma.AttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findFirst: {
            args: Prisma.AttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findMany: {
            args: Prisma.AttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          create: {
            args: Prisma.AttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          createMany: {
            args: Prisma.AttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttendanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          delete: {
            args: Prisma.AttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          update: {
            args: Prisma.AttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          deleteMany: {
            args: Prisma.AttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AttendanceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          upsert: {
            args: Prisma.AttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          aggregate: {
            args: Prisma.AttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttendance>
          }
          groupBy: {
            args: Prisma.AttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<AttendanceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    admin?: AdminOmit
    member?: MemberOmit
    sport?: SportOmit
    turf?: TurfOmit
    turfSport?: TurfSportOmit
    membershipPlan?: MembershipPlanOmit
    memberMembership?: MemberMembershipOmit
    attendance?: AttendanceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type MemberCountOutputType
   */

  export type MemberCountOutputType = {
    memberships: number
    attendances: number
  }

  export type MemberCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | MemberCountOutputTypeCountMembershipsArgs
    attendances?: boolean | MemberCountOutputTypeCountAttendancesArgs
  }

  // Custom InputTypes
  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberCountOutputType
     */
    select?: MemberCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberMembershipWhereInput
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountAttendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
  }


  /**
   * Count Type SportCountOutputType
   */

  export type SportCountOutputType = {
    turfs: number
    membershipPlans: number
    attendances: number
  }

  export type SportCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    turfs?: boolean | SportCountOutputTypeCountTurfsArgs
    membershipPlans?: boolean | SportCountOutputTypeCountMembershipPlansArgs
    attendances?: boolean | SportCountOutputTypeCountAttendancesArgs
  }

  // Custom InputTypes
  /**
   * SportCountOutputType without action
   */
  export type SportCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SportCountOutputType
     */
    select?: SportCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SportCountOutputType without action
   */
  export type SportCountOutputTypeCountTurfsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TurfSportWhereInput
  }

  /**
   * SportCountOutputType without action
   */
  export type SportCountOutputTypeCountMembershipPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipPlanWhereInput
  }

  /**
   * SportCountOutputType without action
   */
  export type SportCountOutputTypeCountAttendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
  }


  /**
   * Count Type TurfCountOutputType
   */

  export type TurfCountOutputType = {
    childTurfs: number
    sports: number
  }

  export type TurfCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    childTurfs?: boolean | TurfCountOutputTypeCountChildTurfsArgs
    sports?: boolean | TurfCountOutputTypeCountSportsArgs
  }

  // Custom InputTypes
  /**
   * TurfCountOutputType without action
   */
  export type TurfCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfCountOutputType
     */
    select?: TurfCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TurfCountOutputType without action
   */
  export type TurfCountOutputTypeCountChildTurfsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TurfWhereInput
  }

  /**
   * TurfCountOutputType without action
   */
  export type TurfCountOutputTypeCountSportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TurfSportWhereInput
  }


  /**
   * Count Type MembershipPlanCountOutputType
   */

  export type MembershipPlanCountOutputType = {
    memberships: number
    attendances: number
  }

  export type MembershipPlanCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | MembershipPlanCountOutputTypeCountMembershipsArgs
    attendances?: boolean | MembershipPlanCountOutputTypeCountAttendancesArgs
  }

  // Custom InputTypes
  /**
   * MembershipPlanCountOutputType without action
   */
  export type MembershipPlanCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlanCountOutputType
     */
    select?: MembershipPlanCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MembershipPlanCountOutputType without action
   */
  export type MembershipPlanCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberMembershipWhereInput
  }

  /**
   * MembershipPlanCountOutputType without action
   */
  export type MembershipPlanCountOutputTypeCountAttendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Admin
   */

  export type AggregateAdmin = {
    _count: AdminCountAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  export type AdminMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminCountAggregateOutputType = {
    id: number
    email: number
    password: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdminMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admin to aggregate.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Admins
    **/
    _count?: true | AdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminMaxAggregateInputType
  }

  export type GetAdminAggregateType<T extends AdminAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmin[P]>
      : GetScalarType<T[P], AggregateAdmin[P]>
  }




  export type AdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminWhereInput
    orderBy?: AdminOrderByWithAggregationInput | AdminOrderByWithAggregationInput[]
    by: AdminScalarFieldEnum[] | AdminScalarFieldEnum
    having?: AdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminCountAggregateInputType | true
    _min?: AdminMinAggregateInputType
    _max?: AdminMaxAggregateInputType
  }

  export type AdminGroupByOutputType = {
    id: string
    email: string
    password: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    _count: AdminCountAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  type GetAdminGroupByPayload<T extends AdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminGroupByOutputType[P]>
            : GetScalarType<T[P], AdminGroupByOutputType[P]>
        }
      >
    >


  export type AdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["admin"]>

  export type AdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["admin"]>

  export type AdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["admin"]>

  export type AdminSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["admin"]>

  export type $AdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Admin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      name: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["admin"]>
    composites: {}
  }

  type AdminGetPayload<S extends boolean | null | undefined | AdminDefaultArgs> = $Result.GetResult<Prisma.$AdminPayload, S>

  type AdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminCountAggregateInputType | true
    }

  export interface AdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Admin'], meta: { name: 'Admin' } }
    /**
     * Find zero or one Admin that matches the filter.
     * @param {AdminFindUniqueArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminFindUniqueArgs>(args: SelectSubset<T, AdminFindUniqueArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Admin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminFindUniqueOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Admin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminFindFirstArgs>(args?: SelectSubset<T, AdminFindFirstArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Admin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Admins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Admins
     * const admins = await prisma.admin.findMany()
     * 
     * // Get first 10 Admins
     * const admins = await prisma.admin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminWithIdOnly = await prisma.admin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminFindManyArgs>(args?: SelectSubset<T, AdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Admin.
     * @param {AdminCreateArgs} args - Arguments to create a Admin.
     * @example
     * // Create one Admin
     * const Admin = await prisma.admin.create({
     *   data: {
     *     // ... data to create a Admin
     *   }
     * })
     * 
     */
    create<T extends AdminCreateArgs>(args: SelectSubset<T, AdminCreateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Admins.
     * @param {AdminCreateManyArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admin = await prisma.admin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminCreateManyArgs>(args?: SelectSubset<T, AdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Admins and returns the data saved in the database.
     * @param {AdminCreateManyAndReturnArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admin = await prisma.admin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Admins and only return the `id`
     * const adminWithIdOnly = await prisma.admin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Admin.
     * @param {AdminDeleteArgs} args - Arguments to delete one Admin.
     * @example
     * // Delete one Admin
     * const Admin = await prisma.admin.delete({
     *   where: {
     *     // ... filter to delete one Admin
     *   }
     * })
     * 
     */
    delete<T extends AdminDeleteArgs>(args: SelectSubset<T, AdminDeleteArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Admin.
     * @param {AdminUpdateArgs} args - Arguments to update one Admin.
     * @example
     * // Update one Admin
     * const admin = await prisma.admin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminUpdateArgs>(args: SelectSubset<T, AdminUpdateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Admins.
     * @param {AdminDeleteManyArgs} args - Arguments to filter Admins to delete.
     * @example
     * // Delete a few Admins
     * const { count } = await prisma.admin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminDeleteManyArgs>(args?: SelectSubset<T, AdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Admins
     * const admin = await prisma.admin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminUpdateManyArgs>(args: SelectSubset<T, AdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admins and returns the data updated in the database.
     * @param {AdminUpdateManyAndReturnArgs} args - Arguments to update many Admins.
     * @example
     * // Update many Admins
     * const admin = await prisma.admin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Admins and only return the `id`
     * const adminWithIdOnly = await prisma.admin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Admin.
     * @param {AdminUpsertArgs} args - Arguments to update or create a Admin.
     * @example
     * // Update or create a Admin
     * const admin = await prisma.admin.upsert({
     *   create: {
     *     // ... data to create a Admin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Admin we want to update
     *   }
     * })
     */
    upsert<T extends AdminUpsertArgs>(args: SelectSubset<T, AdminUpsertArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminCountArgs} args - Arguments to filter Admins to count.
     * @example
     * // Count the number of Admins
     * const count = await prisma.admin.count({
     *   where: {
     *     // ... the filter for the Admins we want to count
     *   }
     * })
    **/
    count<T extends AdminCountArgs>(
      args?: Subset<T, AdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminAggregateArgs>(args: Subset<T, AdminAggregateArgs>): Prisma.PrismaPromise<GetAdminAggregateType<T>>

    /**
     * Group by Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminGroupByArgs['orderBy'] }
        : { orderBy?: AdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Admin model
   */
  readonly fields: AdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Admin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Admin model
   */
  interface AdminFieldRefs {
    readonly id: FieldRef<"Admin", 'String'>
    readonly email: FieldRef<"Admin", 'String'>
    readonly password: FieldRef<"Admin", 'String'>
    readonly name: FieldRef<"Admin", 'String'>
    readonly createdAt: FieldRef<"Admin", 'DateTime'>
    readonly updatedAt: FieldRef<"Admin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Admin findUnique
   */
  export type AdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findUniqueOrThrow
   */
  export type AdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findFirst
   */
  export type AdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findFirstOrThrow
   */
  export type AdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findMany
   */
  export type AdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter, which Admins to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin create
   */
  export type AdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * The data needed to create a Admin.
     */
    data: XOR<AdminCreateInput, AdminUncheckedCreateInput>
  }

  /**
   * Admin createMany
   */
  export type AdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Admins.
     */
    data: AdminCreateManyInput | AdminCreateManyInput[]
  }

  /**
   * Admin createManyAndReturn
   */
  export type AdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * The data used to create many Admins.
     */
    data: AdminCreateManyInput | AdminCreateManyInput[]
  }

  /**
   * Admin update
   */
  export type AdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * The data needed to update a Admin.
     */
    data: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
    /**
     * Choose, which Admin to update.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin updateMany
   */
  export type AdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Admins.
     */
    data: XOR<AdminUpdateManyMutationInput, AdminUncheckedUpdateManyInput>
    /**
     * Filter which Admins to update
     */
    where?: AdminWhereInput
    /**
     * Limit how many Admins to update.
     */
    limit?: number
  }

  /**
   * Admin updateManyAndReturn
   */
  export type AdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * The data used to update Admins.
     */
    data: XOR<AdminUpdateManyMutationInput, AdminUncheckedUpdateManyInput>
    /**
     * Filter which Admins to update
     */
    where?: AdminWhereInput
    /**
     * Limit how many Admins to update.
     */
    limit?: number
  }

  /**
   * Admin upsert
   */
  export type AdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * The filter to search for the Admin to update in case it exists.
     */
    where: AdminWhereUniqueInput
    /**
     * In case the Admin found by the `where` argument doesn't exist, create a new Admin with this data.
     */
    create: XOR<AdminCreateInput, AdminUncheckedCreateInput>
    /**
     * In case the Admin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
  }

  /**
   * Admin delete
   */
  export type AdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
    /**
     * Filter which Admin to delete.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin deleteMany
   */
  export type AdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admins to delete
     */
    where?: AdminWhereInput
    /**
     * Limit how many Admins to delete.
     */
    limit?: number
  }

  /**
   * Admin without action
   */
  export type AdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Admin
     */
    omit?: AdminOmit<ExtArgs> | null
  }


  /**
   * Model Member
   */

  export type AggregateMember = {
    _count: MemberCountAggregateOutputType | null
    _min: MemberMinAggregateOutputType | null
    _max: MemberMaxAggregateOutputType | null
  }

  export type MemberMinAggregateOutputType = {
    id: string | null
    mobile: string | null
    name: string | null
    email: string | null
    joinDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MemberMaxAggregateOutputType = {
    id: string | null
    mobile: string | null
    name: string | null
    email: string | null
    joinDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MemberCountAggregateOutputType = {
    id: number
    mobile: number
    name: number
    email: number
    joinDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MemberMinAggregateInputType = {
    id?: true
    mobile?: true
    name?: true
    email?: true
    joinDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MemberMaxAggregateInputType = {
    id?: true
    mobile?: true
    name?: true
    email?: true
    joinDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MemberCountAggregateInputType = {
    id?: true
    mobile?: true
    name?: true
    email?: true
    joinDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Member to aggregate.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Members
    **/
    _count?: true | MemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemberMaxAggregateInputType
  }

  export type GetMemberAggregateType<T extends MemberAggregateArgs> = {
        [P in keyof T & keyof AggregateMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMember[P]>
      : GetScalarType<T[P], AggregateMember[P]>
  }




  export type MemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberWhereInput
    orderBy?: MemberOrderByWithAggregationInput | MemberOrderByWithAggregationInput[]
    by: MemberScalarFieldEnum[] | MemberScalarFieldEnum
    having?: MemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemberCountAggregateInputType | true
    _min?: MemberMinAggregateInputType
    _max?: MemberMaxAggregateInputType
  }

  export type MemberGroupByOutputType = {
    id: string
    mobile: string
    name: string
    email: string | null
    joinDate: Date
    createdAt: Date
    updatedAt: Date
    _count: MemberCountAggregateOutputType | null
    _min: MemberMinAggregateOutputType | null
    _max: MemberMaxAggregateOutputType | null
  }

  type GetMemberGroupByPayload<T extends MemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemberGroupByOutputType[P]>
            : GetScalarType<T[P], MemberGroupByOutputType[P]>
        }
      >
    >


  export type MemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mobile?: boolean
    name?: boolean
    email?: boolean
    joinDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    memberships?: boolean | Member$membershipsArgs<ExtArgs>
    attendances?: boolean | Member$attendancesArgs<ExtArgs>
    _count?: boolean | MemberCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["member"]>

  export type MemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mobile?: boolean
    name?: boolean
    email?: boolean
    joinDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["member"]>

  export type MemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mobile?: boolean
    name?: boolean
    email?: boolean
    joinDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["member"]>

  export type MemberSelectScalar = {
    id?: boolean
    mobile?: boolean
    name?: boolean
    email?: boolean
    joinDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "mobile" | "name" | "email" | "joinDate" | "createdAt" | "updatedAt", ExtArgs["result"]["member"]>
  export type MemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | Member$membershipsArgs<ExtArgs>
    attendances?: boolean | Member$attendancesArgs<ExtArgs>
    _count?: boolean | MemberCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Member"
    objects: {
      memberships: Prisma.$MemberMembershipPayload<ExtArgs>[]
      attendances: Prisma.$AttendancePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mobile: string
      name: string
      email: string | null
      joinDate: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["member"]>
    composites: {}
  }

  type MemberGetPayload<S extends boolean | null | undefined | MemberDefaultArgs> = $Result.GetResult<Prisma.$MemberPayload, S>

  type MemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemberCountAggregateInputType | true
    }

  export interface MemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Member'], meta: { name: 'Member' } }
    /**
     * Find zero or one Member that matches the filter.
     * @param {MemberFindUniqueArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemberFindUniqueArgs>(args: SelectSubset<T, MemberFindUniqueArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Member that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemberFindUniqueOrThrowArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemberFindUniqueOrThrowArgs>(args: SelectSubset<T, MemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Member that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindFirstArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemberFindFirstArgs>(args?: SelectSubset<T, MemberFindFirstArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Member that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindFirstOrThrowArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemberFindFirstOrThrowArgs>(args?: SelectSubset<T, MemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Members that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Members
     * const members = await prisma.member.findMany()
     * 
     * // Get first 10 Members
     * const members = await prisma.member.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memberWithIdOnly = await prisma.member.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemberFindManyArgs>(args?: SelectSubset<T, MemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Member.
     * @param {MemberCreateArgs} args - Arguments to create a Member.
     * @example
     * // Create one Member
     * const Member = await prisma.member.create({
     *   data: {
     *     // ... data to create a Member
     *   }
     * })
     * 
     */
    create<T extends MemberCreateArgs>(args: SelectSubset<T, MemberCreateArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Members.
     * @param {MemberCreateManyArgs} args - Arguments to create many Members.
     * @example
     * // Create many Members
     * const member = await prisma.member.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemberCreateManyArgs>(args?: SelectSubset<T, MemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Members and returns the data saved in the database.
     * @param {MemberCreateManyAndReturnArgs} args - Arguments to create many Members.
     * @example
     * // Create many Members
     * const member = await prisma.member.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Members and only return the `id`
     * const memberWithIdOnly = await prisma.member.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemberCreateManyAndReturnArgs>(args?: SelectSubset<T, MemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Member.
     * @param {MemberDeleteArgs} args - Arguments to delete one Member.
     * @example
     * // Delete one Member
     * const Member = await prisma.member.delete({
     *   where: {
     *     // ... filter to delete one Member
     *   }
     * })
     * 
     */
    delete<T extends MemberDeleteArgs>(args: SelectSubset<T, MemberDeleteArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Member.
     * @param {MemberUpdateArgs} args - Arguments to update one Member.
     * @example
     * // Update one Member
     * const member = await prisma.member.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemberUpdateArgs>(args: SelectSubset<T, MemberUpdateArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Members.
     * @param {MemberDeleteManyArgs} args - Arguments to filter Members to delete.
     * @example
     * // Delete a few Members
     * const { count } = await prisma.member.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemberDeleteManyArgs>(args?: SelectSubset<T, MemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Members.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Members
     * const member = await prisma.member.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemberUpdateManyArgs>(args: SelectSubset<T, MemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Members and returns the data updated in the database.
     * @param {MemberUpdateManyAndReturnArgs} args - Arguments to update many Members.
     * @example
     * // Update many Members
     * const member = await prisma.member.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Members and only return the `id`
     * const memberWithIdOnly = await prisma.member.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemberUpdateManyAndReturnArgs>(args: SelectSubset<T, MemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Member.
     * @param {MemberUpsertArgs} args - Arguments to update or create a Member.
     * @example
     * // Update or create a Member
     * const member = await prisma.member.upsert({
     *   create: {
     *     // ... data to create a Member
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Member we want to update
     *   }
     * })
     */
    upsert<T extends MemberUpsertArgs>(args: SelectSubset<T, MemberUpsertArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Members.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberCountArgs} args - Arguments to filter Members to count.
     * @example
     * // Count the number of Members
     * const count = await prisma.member.count({
     *   where: {
     *     // ... the filter for the Members we want to count
     *   }
     * })
    **/
    count<T extends MemberCountArgs>(
      args?: Subset<T, MemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Member.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemberAggregateArgs>(args: Subset<T, MemberAggregateArgs>): Prisma.PrismaPromise<GetMemberAggregateType<T>>

    /**
     * Group by Member.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemberGroupByArgs['orderBy'] }
        : { orderBy?: MemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Member model
   */
  readonly fields: MemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Member.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memberships<T extends Member$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, Member$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    attendances<T extends Member$attendancesArgs<ExtArgs> = {}>(args?: Subset<T, Member$attendancesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Member model
   */
  interface MemberFieldRefs {
    readonly id: FieldRef<"Member", 'String'>
    readonly mobile: FieldRef<"Member", 'String'>
    readonly name: FieldRef<"Member", 'String'>
    readonly email: FieldRef<"Member", 'String'>
    readonly joinDate: FieldRef<"Member", 'DateTime'>
    readonly createdAt: FieldRef<"Member", 'DateTime'>
    readonly updatedAt: FieldRef<"Member", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Member findUnique
   */
  export type MemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member findUniqueOrThrow
   */
  export type MemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member findFirst
   */
  export type MemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Members.
     */
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member findFirstOrThrow
   */
  export type MemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Members.
     */
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member findMany
   */
  export type MemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Members to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Members.
     */
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member create
   */
  export type MemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The data needed to create a Member.
     */
    data: XOR<MemberCreateInput, MemberUncheckedCreateInput>
  }

  /**
   * Member createMany
   */
  export type MemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Members.
     */
    data: MemberCreateManyInput | MemberCreateManyInput[]
  }

  /**
   * Member createManyAndReturn
   */
  export type MemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * The data used to create many Members.
     */
    data: MemberCreateManyInput | MemberCreateManyInput[]
  }

  /**
   * Member update
   */
  export type MemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The data needed to update a Member.
     */
    data: XOR<MemberUpdateInput, MemberUncheckedUpdateInput>
    /**
     * Choose, which Member to update.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member updateMany
   */
  export type MemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Members.
     */
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyInput>
    /**
     * Filter which Members to update
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to update.
     */
    limit?: number
  }

  /**
   * Member updateManyAndReturn
   */
  export type MemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * The data used to update Members.
     */
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyInput>
    /**
     * Filter which Members to update
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to update.
     */
    limit?: number
  }

  /**
   * Member upsert
   */
  export type MemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The filter to search for the Member to update in case it exists.
     */
    where: MemberWhereUniqueInput
    /**
     * In case the Member found by the `where` argument doesn't exist, create a new Member with this data.
     */
    create: XOR<MemberCreateInput, MemberUncheckedCreateInput>
    /**
     * In case the Member was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemberUpdateInput, MemberUncheckedUpdateInput>
  }

  /**
   * Member delete
   */
  export type MemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter which Member to delete.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member deleteMany
   */
  export type MemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Members to delete
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to delete.
     */
    limit?: number
  }

  /**
   * Member.memberships
   */
  export type Member$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    where?: MemberMembershipWhereInput
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    cursor?: MemberMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberMembershipScalarFieldEnum | MemberMembershipScalarFieldEnum[]
  }

  /**
   * Member.attendances
   */
  export type Member$attendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    cursor?: AttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Member without action
   */
  export type MemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
  }


  /**
   * Model Sport
   */

  export type AggregateSport = {
    _count: SportCountAggregateOutputType | null
    _min: SportMinAggregateOutputType | null
    _max: SportMaxAggregateOutputType | null
  }

  export type SportMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SportMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SportCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SportMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SportMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SportCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sport to aggregate.
     */
    where?: SportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sports to fetch.
     */
    orderBy?: SportOrderByWithRelationInput | SportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sports
    **/
    _count?: true | SportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SportMaxAggregateInputType
  }

  export type GetSportAggregateType<T extends SportAggregateArgs> = {
        [P in keyof T & keyof AggregateSport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSport[P]>
      : GetScalarType<T[P], AggregateSport[P]>
  }




  export type SportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SportWhereInput
    orderBy?: SportOrderByWithAggregationInput | SportOrderByWithAggregationInput[]
    by: SportScalarFieldEnum[] | SportScalarFieldEnum
    having?: SportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SportCountAggregateInputType | true
    _min?: SportMinAggregateInputType
    _max?: SportMaxAggregateInputType
  }

  export type SportGroupByOutputType = {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: SportCountAggregateOutputType | null
    _min: SportMinAggregateOutputType | null
    _max: SportMaxAggregateOutputType | null
  }

  type GetSportGroupByPayload<T extends SportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SportGroupByOutputType[P]>
            : GetScalarType<T[P], SportGroupByOutputType[P]>
        }
      >
    >


  export type SportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    turfs?: boolean | Sport$turfsArgs<ExtArgs>
    membershipPlans?: boolean | Sport$membershipPlansArgs<ExtArgs>
    attendances?: boolean | Sport$attendancesArgs<ExtArgs>
    _count?: boolean | SportCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sport"]>

  export type SportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sport"]>

  export type SportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sport"]>

  export type SportSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["sport"]>
  export type SportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    turfs?: boolean | Sport$turfsArgs<ExtArgs>
    membershipPlans?: boolean | Sport$membershipPlansArgs<ExtArgs>
    attendances?: boolean | Sport$attendancesArgs<ExtArgs>
    _count?: boolean | SportCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SportIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sport"
    objects: {
      turfs: Prisma.$TurfSportPayload<ExtArgs>[]
      membershipPlans: Prisma.$MembershipPlanPayload<ExtArgs>[]
      attendances: Prisma.$AttendancePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sport"]>
    composites: {}
  }

  type SportGetPayload<S extends boolean | null | undefined | SportDefaultArgs> = $Result.GetResult<Prisma.$SportPayload, S>

  type SportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SportCountAggregateInputType | true
    }

  export interface SportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sport'], meta: { name: 'Sport' } }
    /**
     * Find zero or one Sport that matches the filter.
     * @param {SportFindUniqueArgs} args - Arguments to find a Sport
     * @example
     * // Get one Sport
     * const sport = await prisma.sport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SportFindUniqueArgs>(args: SelectSubset<T, SportFindUniqueArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SportFindUniqueOrThrowArgs} args - Arguments to find a Sport
     * @example
     * // Get one Sport
     * const sport = await prisma.sport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SportFindUniqueOrThrowArgs>(args: SelectSubset<T, SportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportFindFirstArgs} args - Arguments to find a Sport
     * @example
     * // Get one Sport
     * const sport = await prisma.sport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SportFindFirstArgs>(args?: SelectSubset<T, SportFindFirstArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportFindFirstOrThrowArgs} args - Arguments to find a Sport
     * @example
     * // Get one Sport
     * const sport = await prisma.sport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SportFindFirstOrThrowArgs>(args?: SelectSubset<T, SportFindFirstOrThrowArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sports
     * const sports = await prisma.sport.findMany()
     * 
     * // Get first 10 Sports
     * const sports = await prisma.sport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sportWithIdOnly = await prisma.sport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SportFindManyArgs>(args?: SelectSubset<T, SportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sport.
     * @param {SportCreateArgs} args - Arguments to create a Sport.
     * @example
     * // Create one Sport
     * const Sport = await prisma.sport.create({
     *   data: {
     *     // ... data to create a Sport
     *   }
     * })
     * 
     */
    create<T extends SportCreateArgs>(args: SelectSubset<T, SportCreateArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sports.
     * @param {SportCreateManyArgs} args - Arguments to create many Sports.
     * @example
     * // Create many Sports
     * const sport = await prisma.sport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SportCreateManyArgs>(args?: SelectSubset<T, SportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sports and returns the data saved in the database.
     * @param {SportCreateManyAndReturnArgs} args - Arguments to create many Sports.
     * @example
     * // Create many Sports
     * const sport = await prisma.sport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sports and only return the `id`
     * const sportWithIdOnly = await prisma.sport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SportCreateManyAndReturnArgs>(args?: SelectSubset<T, SportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sport.
     * @param {SportDeleteArgs} args - Arguments to delete one Sport.
     * @example
     * // Delete one Sport
     * const Sport = await prisma.sport.delete({
     *   where: {
     *     // ... filter to delete one Sport
     *   }
     * })
     * 
     */
    delete<T extends SportDeleteArgs>(args: SelectSubset<T, SportDeleteArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sport.
     * @param {SportUpdateArgs} args - Arguments to update one Sport.
     * @example
     * // Update one Sport
     * const sport = await prisma.sport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SportUpdateArgs>(args: SelectSubset<T, SportUpdateArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sports.
     * @param {SportDeleteManyArgs} args - Arguments to filter Sports to delete.
     * @example
     * // Delete a few Sports
     * const { count } = await prisma.sport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SportDeleteManyArgs>(args?: SelectSubset<T, SportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sports
     * const sport = await prisma.sport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SportUpdateManyArgs>(args: SelectSubset<T, SportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sports and returns the data updated in the database.
     * @param {SportUpdateManyAndReturnArgs} args - Arguments to update many Sports.
     * @example
     * // Update many Sports
     * const sport = await prisma.sport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sports and only return the `id`
     * const sportWithIdOnly = await prisma.sport.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SportUpdateManyAndReturnArgs>(args: SelectSubset<T, SportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sport.
     * @param {SportUpsertArgs} args - Arguments to update or create a Sport.
     * @example
     * // Update or create a Sport
     * const sport = await prisma.sport.upsert({
     *   create: {
     *     // ... data to create a Sport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sport we want to update
     *   }
     * })
     */
    upsert<T extends SportUpsertArgs>(args: SelectSubset<T, SportUpsertArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportCountArgs} args - Arguments to filter Sports to count.
     * @example
     * // Count the number of Sports
     * const count = await prisma.sport.count({
     *   where: {
     *     // ... the filter for the Sports we want to count
     *   }
     * })
    **/
    count<T extends SportCountArgs>(
      args?: Subset<T, SportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SportAggregateArgs>(args: Subset<T, SportAggregateArgs>): Prisma.PrismaPromise<GetSportAggregateType<T>>

    /**
     * Group by Sport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SportGroupByArgs['orderBy'] }
        : { orderBy?: SportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sport model
   */
  readonly fields: SportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    turfs<T extends Sport$turfsArgs<ExtArgs> = {}>(args?: Subset<T, Sport$turfsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    membershipPlans<T extends Sport$membershipPlansArgs<ExtArgs> = {}>(args?: Subset<T, Sport$membershipPlansArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    attendances<T extends Sport$attendancesArgs<ExtArgs> = {}>(args?: Subset<T, Sport$attendancesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sport model
   */
  interface SportFieldRefs {
    readonly id: FieldRef<"Sport", 'String'>
    readonly name: FieldRef<"Sport", 'String'>
    readonly description: FieldRef<"Sport", 'String'>
    readonly createdAt: FieldRef<"Sport", 'DateTime'>
    readonly updatedAt: FieldRef<"Sport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Sport findUnique
   */
  export type SportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter, which Sport to fetch.
     */
    where: SportWhereUniqueInput
  }

  /**
   * Sport findUniqueOrThrow
   */
  export type SportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter, which Sport to fetch.
     */
    where: SportWhereUniqueInput
  }

  /**
   * Sport findFirst
   */
  export type SportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter, which Sport to fetch.
     */
    where?: SportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sports to fetch.
     */
    orderBy?: SportOrderByWithRelationInput | SportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sports.
     */
    cursor?: SportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sports.
     */
    distinct?: SportScalarFieldEnum | SportScalarFieldEnum[]
  }

  /**
   * Sport findFirstOrThrow
   */
  export type SportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter, which Sport to fetch.
     */
    where?: SportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sports to fetch.
     */
    orderBy?: SportOrderByWithRelationInput | SportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sports.
     */
    cursor?: SportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sports.
     */
    distinct?: SportScalarFieldEnum | SportScalarFieldEnum[]
  }

  /**
   * Sport findMany
   */
  export type SportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter, which Sports to fetch.
     */
    where?: SportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sports to fetch.
     */
    orderBy?: SportOrderByWithRelationInput | SportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sports.
     */
    cursor?: SportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sports.
     */
    distinct?: SportScalarFieldEnum | SportScalarFieldEnum[]
  }

  /**
   * Sport create
   */
  export type SportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * The data needed to create a Sport.
     */
    data: XOR<SportCreateInput, SportUncheckedCreateInput>
  }

  /**
   * Sport createMany
   */
  export type SportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sports.
     */
    data: SportCreateManyInput | SportCreateManyInput[]
  }

  /**
   * Sport createManyAndReturn
   */
  export type SportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * The data used to create many Sports.
     */
    data: SportCreateManyInput | SportCreateManyInput[]
  }

  /**
   * Sport update
   */
  export type SportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * The data needed to update a Sport.
     */
    data: XOR<SportUpdateInput, SportUncheckedUpdateInput>
    /**
     * Choose, which Sport to update.
     */
    where: SportWhereUniqueInput
  }

  /**
   * Sport updateMany
   */
  export type SportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sports.
     */
    data: XOR<SportUpdateManyMutationInput, SportUncheckedUpdateManyInput>
    /**
     * Filter which Sports to update
     */
    where?: SportWhereInput
    /**
     * Limit how many Sports to update.
     */
    limit?: number
  }

  /**
   * Sport updateManyAndReturn
   */
  export type SportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * The data used to update Sports.
     */
    data: XOR<SportUpdateManyMutationInput, SportUncheckedUpdateManyInput>
    /**
     * Filter which Sports to update
     */
    where?: SportWhereInput
    /**
     * Limit how many Sports to update.
     */
    limit?: number
  }

  /**
   * Sport upsert
   */
  export type SportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * The filter to search for the Sport to update in case it exists.
     */
    where: SportWhereUniqueInput
    /**
     * In case the Sport found by the `where` argument doesn't exist, create a new Sport with this data.
     */
    create: XOR<SportCreateInput, SportUncheckedCreateInput>
    /**
     * In case the Sport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SportUpdateInput, SportUncheckedUpdateInput>
  }

  /**
   * Sport delete
   */
  export type SportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    /**
     * Filter which Sport to delete.
     */
    where: SportWhereUniqueInput
  }

  /**
   * Sport deleteMany
   */
  export type SportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sports to delete
     */
    where?: SportWhereInput
    /**
     * Limit how many Sports to delete.
     */
    limit?: number
  }

  /**
   * Sport.turfs
   */
  export type Sport$turfsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    where?: TurfSportWhereInput
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    cursor?: TurfSportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TurfSportScalarFieldEnum | TurfSportScalarFieldEnum[]
  }

  /**
   * Sport.membershipPlans
   */
  export type Sport$membershipPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    where?: MembershipPlanWhereInput
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    cursor?: MembershipPlanWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * Sport.attendances
   */
  export type Sport$attendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    cursor?: AttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Sport without action
   */
  export type SportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
  }


  /**
   * Model Turf
   */

  export type AggregateTurf = {
    _count: TurfCountAggregateOutputType | null
    _min: TurfMinAggregateOutputType | null
    _max: TurfMaxAggregateOutputType | null
  }

  export type TurfMinAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    parentTurfId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TurfMaxAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    parentTurfId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TurfCountAggregateOutputType = {
    id: number
    name: number
    location: number
    parentTurfId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TurfMinAggregateInputType = {
    id?: true
    name?: true
    location?: true
    parentTurfId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TurfMaxAggregateInputType = {
    id?: true
    name?: true
    location?: true
    parentTurfId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TurfCountAggregateInputType = {
    id?: true
    name?: true
    location?: true
    parentTurfId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TurfAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Turf to aggregate.
     */
    where?: TurfWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Turfs to fetch.
     */
    orderBy?: TurfOrderByWithRelationInput | TurfOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TurfWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Turfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Turfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Turfs
    **/
    _count?: true | TurfCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TurfMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TurfMaxAggregateInputType
  }

  export type GetTurfAggregateType<T extends TurfAggregateArgs> = {
        [P in keyof T & keyof AggregateTurf]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTurf[P]>
      : GetScalarType<T[P], AggregateTurf[P]>
  }




  export type TurfGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TurfWhereInput
    orderBy?: TurfOrderByWithAggregationInput | TurfOrderByWithAggregationInput[]
    by: TurfScalarFieldEnum[] | TurfScalarFieldEnum
    having?: TurfScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TurfCountAggregateInputType | true
    _min?: TurfMinAggregateInputType
    _max?: TurfMaxAggregateInputType
  }

  export type TurfGroupByOutputType = {
    id: string
    name: string
    location: string | null
    parentTurfId: string | null
    createdAt: Date
    updatedAt: Date
    _count: TurfCountAggregateOutputType | null
    _min: TurfMinAggregateOutputType | null
    _max: TurfMaxAggregateOutputType | null
  }

  type GetTurfGroupByPayload<T extends TurfGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TurfGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TurfGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TurfGroupByOutputType[P]>
            : GetScalarType<T[P], TurfGroupByOutputType[P]>
        }
      >
    >


  export type TurfSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    parentTurfId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
    childTurfs?: boolean | Turf$childTurfsArgs<ExtArgs>
    sports?: boolean | Turf$sportsArgs<ExtArgs>
    _count?: boolean | TurfCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["turf"]>

  export type TurfSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    parentTurfId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
  }, ExtArgs["result"]["turf"]>

  export type TurfSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    parentTurfId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
  }, ExtArgs["result"]["turf"]>

  export type TurfSelectScalar = {
    id?: boolean
    name?: boolean
    location?: boolean
    parentTurfId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TurfOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "location" | "parentTurfId" | "createdAt" | "updatedAt", ExtArgs["result"]["turf"]>
  export type TurfInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
    childTurfs?: boolean | Turf$childTurfsArgs<ExtArgs>
    sports?: boolean | Turf$sportsArgs<ExtArgs>
    _count?: boolean | TurfCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TurfIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
  }
  export type TurfIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parentTurf?: boolean | Turf$parentTurfArgs<ExtArgs>
  }

  export type $TurfPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Turf"
    objects: {
      parentTurf: Prisma.$TurfPayload<ExtArgs> | null
      childTurfs: Prisma.$TurfPayload<ExtArgs>[]
      sports: Prisma.$TurfSportPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      location: string | null
      parentTurfId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["turf"]>
    composites: {}
  }

  type TurfGetPayload<S extends boolean | null | undefined | TurfDefaultArgs> = $Result.GetResult<Prisma.$TurfPayload, S>

  type TurfCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TurfFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TurfCountAggregateInputType | true
    }

  export interface TurfDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Turf'], meta: { name: 'Turf' } }
    /**
     * Find zero or one Turf that matches the filter.
     * @param {TurfFindUniqueArgs} args - Arguments to find a Turf
     * @example
     * // Get one Turf
     * const turf = await prisma.turf.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TurfFindUniqueArgs>(args: SelectSubset<T, TurfFindUniqueArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Turf that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TurfFindUniqueOrThrowArgs} args - Arguments to find a Turf
     * @example
     * // Get one Turf
     * const turf = await prisma.turf.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TurfFindUniqueOrThrowArgs>(args: SelectSubset<T, TurfFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Turf that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfFindFirstArgs} args - Arguments to find a Turf
     * @example
     * // Get one Turf
     * const turf = await prisma.turf.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TurfFindFirstArgs>(args?: SelectSubset<T, TurfFindFirstArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Turf that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfFindFirstOrThrowArgs} args - Arguments to find a Turf
     * @example
     * // Get one Turf
     * const turf = await prisma.turf.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TurfFindFirstOrThrowArgs>(args?: SelectSubset<T, TurfFindFirstOrThrowArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Turfs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Turfs
     * const turfs = await prisma.turf.findMany()
     * 
     * // Get first 10 Turfs
     * const turfs = await prisma.turf.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const turfWithIdOnly = await prisma.turf.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TurfFindManyArgs>(args?: SelectSubset<T, TurfFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Turf.
     * @param {TurfCreateArgs} args - Arguments to create a Turf.
     * @example
     * // Create one Turf
     * const Turf = await prisma.turf.create({
     *   data: {
     *     // ... data to create a Turf
     *   }
     * })
     * 
     */
    create<T extends TurfCreateArgs>(args: SelectSubset<T, TurfCreateArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Turfs.
     * @param {TurfCreateManyArgs} args - Arguments to create many Turfs.
     * @example
     * // Create many Turfs
     * const turf = await prisma.turf.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TurfCreateManyArgs>(args?: SelectSubset<T, TurfCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Turfs and returns the data saved in the database.
     * @param {TurfCreateManyAndReturnArgs} args - Arguments to create many Turfs.
     * @example
     * // Create many Turfs
     * const turf = await prisma.turf.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Turfs and only return the `id`
     * const turfWithIdOnly = await prisma.turf.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TurfCreateManyAndReturnArgs>(args?: SelectSubset<T, TurfCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Turf.
     * @param {TurfDeleteArgs} args - Arguments to delete one Turf.
     * @example
     * // Delete one Turf
     * const Turf = await prisma.turf.delete({
     *   where: {
     *     // ... filter to delete one Turf
     *   }
     * })
     * 
     */
    delete<T extends TurfDeleteArgs>(args: SelectSubset<T, TurfDeleteArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Turf.
     * @param {TurfUpdateArgs} args - Arguments to update one Turf.
     * @example
     * // Update one Turf
     * const turf = await prisma.turf.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TurfUpdateArgs>(args: SelectSubset<T, TurfUpdateArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Turfs.
     * @param {TurfDeleteManyArgs} args - Arguments to filter Turfs to delete.
     * @example
     * // Delete a few Turfs
     * const { count } = await prisma.turf.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TurfDeleteManyArgs>(args?: SelectSubset<T, TurfDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Turfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Turfs
     * const turf = await prisma.turf.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TurfUpdateManyArgs>(args: SelectSubset<T, TurfUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Turfs and returns the data updated in the database.
     * @param {TurfUpdateManyAndReturnArgs} args - Arguments to update many Turfs.
     * @example
     * // Update many Turfs
     * const turf = await prisma.turf.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Turfs and only return the `id`
     * const turfWithIdOnly = await prisma.turf.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TurfUpdateManyAndReturnArgs>(args: SelectSubset<T, TurfUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Turf.
     * @param {TurfUpsertArgs} args - Arguments to update or create a Turf.
     * @example
     * // Update or create a Turf
     * const turf = await prisma.turf.upsert({
     *   create: {
     *     // ... data to create a Turf
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Turf we want to update
     *   }
     * })
     */
    upsert<T extends TurfUpsertArgs>(args: SelectSubset<T, TurfUpsertArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Turfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfCountArgs} args - Arguments to filter Turfs to count.
     * @example
     * // Count the number of Turfs
     * const count = await prisma.turf.count({
     *   where: {
     *     // ... the filter for the Turfs we want to count
     *   }
     * })
    **/
    count<T extends TurfCountArgs>(
      args?: Subset<T, TurfCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TurfCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Turf.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TurfAggregateArgs>(args: Subset<T, TurfAggregateArgs>): Prisma.PrismaPromise<GetTurfAggregateType<T>>

    /**
     * Group by Turf.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TurfGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TurfGroupByArgs['orderBy'] }
        : { orderBy?: TurfGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TurfGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTurfGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Turf model
   */
  readonly fields: TurfFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Turf.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TurfClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parentTurf<T extends Turf$parentTurfArgs<ExtArgs> = {}>(args?: Subset<T, Turf$parentTurfArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    childTurfs<T extends Turf$childTurfsArgs<ExtArgs> = {}>(args?: Subset<T, Turf$childTurfsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sports<T extends Turf$sportsArgs<ExtArgs> = {}>(args?: Subset<T, Turf$sportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Turf model
   */
  interface TurfFieldRefs {
    readonly id: FieldRef<"Turf", 'String'>
    readonly name: FieldRef<"Turf", 'String'>
    readonly location: FieldRef<"Turf", 'String'>
    readonly parentTurfId: FieldRef<"Turf", 'String'>
    readonly createdAt: FieldRef<"Turf", 'DateTime'>
    readonly updatedAt: FieldRef<"Turf", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Turf findUnique
   */
  export type TurfFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter, which Turf to fetch.
     */
    where: TurfWhereUniqueInput
  }

  /**
   * Turf findUniqueOrThrow
   */
  export type TurfFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter, which Turf to fetch.
     */
    where: TurfWhereUniqueInput
  }

  /**
   * Turf findFirst
   */
  export type TurfFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter, which Turf to fetch.
     */
    where?: TurfWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Turfs to fetch.
     */
    orderBy?: TurfOrderByWithRelationInput | TurfOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Turfs.
     */
    cursor?: TurfWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Turfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Turfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Turfs.
     */
    distinct?: TurfScalarFieldEnum | TurfScalarFieldEnum[]
  }

  /**
   * Turf findFirstOrThrow
   */
  export type TurfFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter, which Turf to fetch.
     */
    where?: TurfWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Turfs to fetch.
     */
    orderBy?: TurfOrderByWithRelationInput | TurfOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Turfs.
     */
    cursor?: TurfWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Turfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Turfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Turfs.
     */
    distinct?: TurfScalarFieldEnum | TurfScalarFieldEnum[]
  }

  /**
   * Turf findMany
   */
  export type TurfFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter, which Turfs to fetch.
     */
    where?: TurfWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Turfs to fetch.
     */
    orderBy?: TurfOrderByWithRelationInput | TurfOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Turfs.
     */
    cursor?: TurfWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Turfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Turfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Turfs.
     */
    distinct?: TurfScalarFieldEnum | TurfScalarFieldEnum[]
  }

  /**
   * Turf create
   */
  export type TurfCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * The data needed to create a Turf.
     */
    data: XOR<TurfCreateInput, TurfUncheckedCreateInput>
  }

  /**
   * Turf createMany
   */
  export type TurfCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Turfs.
     */
    data: TurfCreateManyInput | TurfCreateManyInput[]
  }

  /**
   * Turf createManyAndReturn
   */
  export type TurfCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * The data used to create many Turfs.
     */
    data: TurfCreateManyInput | TurfCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Turf update
   */
  export type TurfUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * The data needed to update a Turf.
     */
    data: XOR<TurfUpdateInput, TurfUncheckedUpdateInput>
    /**
     * Choose, which Turf to update.
     */
    where: TurfWhereUniqueInput
  }

  /**
   * Turf updateMany
   */
  export type TurfUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Turfs.
     */
    data: XOR<TurfUpdateManyMutationInput, TurfUncheckedUpdateManyInput>
    /**
     * Filter which Turfs to update
     */
    where?: TurfWhereInput
    /**
     * Limit how many Turfs to update.
     */
    limit?: number
  }

  /**
   * Turf updateManyAndReturn
   */
  export type TurfUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * The data used to update Turfs.
     */
    data: XOR<TurfUpdateManyMutationInput, TurfUncheckedUpdateManyInput>
    /**
     * Filter which Turfs to update
     */
    where?: TurfWhereInput
    /**
     * Limit how many Turfs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Turf upsert
   */
  export type TurfUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * The filter to search for the Turf to update in case it exists.
     */
    where: TurfWhereUniqueInput
    /**
     * In case the Turf found by the `where` argument doesn't exist, create a new Turf with this data.
     */
    create: XOR<TurfCreateInput, TurfUncheckedCreateInput>
    /**
     * In case the Turf was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TurfUpdateInput, TurfUncheckedUpdateInput>
  }

  /**
   * Turf delete
   */
  export type TurfDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    /**
     * Filter which Turf to delete.
     */
    where: TurfWhereUniqueInput
  }

  /**
   * Turf deleteMany
   */
  export type TurfDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Turfs to delete
     */
    where?: TurfWhereInput
    /**
     * Limit how many Turfs to delete.
     */
    limit?: number
  }

  /**
   * Turf.parentTurf
   */
  export type Turf$parentTurfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    where?: TurfWhereInput
  }

  /**
   * Turf.childTurfs
   */
  export type Turf$childTurfsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
    where?: TurfWhereInput
    orderBy?: TurfOrderByWithRelationInput | TurfOrderByWithRelationInput[]
    cursor?: TurfWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TurfScalarFieldEnum | TurfScalarFieldEnum[]
  }

  /**
   * Turf.sports
   */
  export type Turf$sportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    where?: TurfSportWhereInput
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    cursor?: TurfSportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TurfSportScalarFieldEnum | TurfSportScalarFieldEnum[]
  }

  /**
   * Turf without action
   */
  export type TurfDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Turf
     */
    select?: TurfSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Turf
     */
    omit?: TurfOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfInclude<ExtArgs> | null
  }


  /**
   * Model TurfSport
   */

  export type AggregateTurfSport = {
    _count: TurfSportCountAggregateOutputType | null
    _min: TurfSportMinAggregateOutputType | null
    _max: TurfSportMaxAggregateOutputType | null
  }

  export type TurfSportMinAggregateOutputType = {
    turfId: string | null
    sportId: string | null
  }

  export type TurfSportMaxAggregateOutputType = {
    turfId: string | null
    sportId: string | null
  }

  export type TurfSportCountAggregateOutputType = {
    turfId: number
    sportId: number
    _all: number
  }


  export type TurfSportMinAggregateInputType = {
    turfId?: true
    sportId?: true
  }

  export type TurfSportMaxAggregateInputType = {
    turfId?: true
    sportId?: true
  }

  export type TurfSportCountAggregateInputType = {
    turfId?: true
    sportId?: true
    _all?: true
  }

  export type TurfSportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TurfSport to aggregate.
     */
    where?: TurfSportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TurfSports to fetch.
     */
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TurfSportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TurfSports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TurfSports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TurfSports
    **/
    _count?: true | TurfSportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TurfSportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TurfSportMaxAggregateInputType
  }

  export type GetTurfSportAggregateType<T extends TurfSportAggregateArgs> = {
        [P in keyof T & keyof AggregateTurfSport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTurfSport[P]>
      : GetScalarType<T[P], AggregateTurfSport[P]>
  }




  export type TurfSportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TurfSportWhereInput
    orderBy?: TurfSportOrderByWithAggregationInput | TurfSportOrderByWithAggregationInput[]
    by: TurfSportScalarFieldEnum[] | TurfSportScalarFieldEnum
    having?: TurfSportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TurfSportCountAggregateInputType | true
    _min?: TurfSportMinAggregateInputType
    _max?: TurfSportMaxAggregateInputType
  }

  export type TurfSportGroupByOutputType = {
    turfId: string
    sportId: string
    _count: TurfSportCountAggregateOutputType | null
    _min: TurfSportMinAggregateOutputType | null
    _max: TurfSportMaxAggregateOutputType | null
  }

  type GetTurfSportGroupByPayload<T extends TurfSportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TurfSportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TurfSportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TurfSportGroupByOutputType[P]>
            : GetScalarType<T[P], TurfSportGroupByOutputType[P]>
        }
      >
    >


  export type TurfSportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    turfId?: boolean
    sportId?: boolean
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["turfSport"]>

  export type TurfSportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    turfId?: boolean
    sportId?: boolean
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["turfSport"]>

  export type TurfSportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    turfId?: boolean
    sportId?: boolean
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["turfSport"]>

  export type TurfSportSelectScalar = {
    turfId?: boolean
    sportId?: boolean
  }

  export type TurfSportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"turfId" | "sportId", ExtArgs["result"]["turfSport"]>
  export type TurfSportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }
  export type TurfSportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }
  export type TurfSportIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    turf?: boolean | TurfDefaultArgs<ExtArgs>
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }

  export type $TurfSportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TurfSport"
    objects: {
      turf: Prisma.$TurfPayload<ExtArgs>
      sport: Prisma.$SportPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      turfId: string
      sportId: string
    }, ExtArgs["result"]["turfSport"]>
    composites: {}
  }

  type TurfSportGetPayload<S extends boolean | null | undefined | TurfSportDefaultArgs> = $Result.GetResult<Prisma.$TurfSportPayload, S>

  type TurfSportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TurfSportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TurfSportCountAggregateInputType | true
    }

  export interface TurfSportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TurfSport'], meta: { name: 'TurfSport' } }
    /**
     * Find zero or one TurfSport that matches the filter.
     * @param {TurfSportFindUniqueArgs} args - Arguments to find a TurfSport
     * @example
     * // Get one TurfSport
     * const turfSport = await prisma.turfSport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TurfSportFindUniqueArgs>(args: SelectSubset<T, TurfSportFindUniqueArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TurfSport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TurfSportFindUniqueOrThrowArgs} args - Arguments to find a TurfSport
     * @example
     * // Get one TurfSport
     * const turfSport = await prisma.turfSport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TurfSportFindUniqueOrThrowArgs>(args: SelectSubset<T, TurfSportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TurfSport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportFindFirstArgs} args - Arguments to find a TurfSport
     * @example
     * // Get one TurfSport
     * const turfSport = await prisma.turfSport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TurfSportFindFirstArgs>(args?: SelectSubset<T, TurfSportFindFirstArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TurfSport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportFindFirstOrThrowArgs} args - Arguments to find a TurfSport
     * @example
     * // Get one TurfSport
     * const turfSport = await prisma.turfSport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TurfSportFindFirstOrThrowArgs>(args?: SelectSubset<T, TurfSportFindFirstOrThrowArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TurfSports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TurfSports
     * const turfSports = await prisma.turfSport.findMany()
     * 
     * // Get first 10 TurfSports
     * const turfSports = await prisma.turfSport.findMany({ take: 10 })
     * 
     * // Only select the `turfId`
     * const turfSportWithTurfIdOnly = await prisma.turfSport.findMany({ select: { turfId: true } })
     * 
     */
    findMany<T extends TurfSportFindManyArgs>(args?: SelectSubset<T, TurfSportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TurfSport.
     * @param {TurfSportCreateArgs} args - Arguments to create a TurfSport.
     * @example
     * // Create one TurfSport
     * const TurfSport = await prisma.turfSport.create({
     *   data: {
     *     // ... data to create a TurfSport
     *   }
     * })
     * 
     */
    create<T extends TurfSportCreateArgs>(args: SelectSubset<T, TurfSportCreateArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TurfSports.
     * @param {TurfSportCreateManyArgs} args - Arguments to create many TurfSports.
     * @example
     * // Create many TurfSports
     * const turfSport = await prisma.turfSport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TurfSportCreateManyArgs>(args?: SelectSubset<T, TurfSportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TurfSports and returns the data saved in the database.
     * @param {TurfSportCreateManyAndReturnArgs} args - Arguments to create many TurfSports.
     * @example
     * // Create many TurfSports
     * const turfSport = await prisma.turfSport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TurfSports and only return the `turfId`
     * const turfSportWithTurfIdOnly = await prisma.turfSport.createManyAndReturn({
     *   select: { turfId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TurfSportCreateManyAndReturnArgs>(args?: SelectSubset<T, TurfSportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TurfSport.
     * @param {TurfSportDeleteArgs} args - Arguments to delete one TurfSport.
     * @example
     * // Delete one TurfSport
     * const TurfSport = await prisma.turfSport.delete({
     *   where: {
     *     // ... filter to delete one TurfSport
     *   }
     * })
     * 
     */
    delete<T extends TurfSportDeleteArgs>(args: SelectSubset<T, TurfSportDeleteArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TurfSport.
     * @param {TurfSportUpdateArgs} args - Arguments to update one TurfSport.
     * @example
     * // Update one TurfSport
     * const turfSport = await prisma.turfSport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TurfSportUpdateArgs>(args: SelectSubset<T, TurfSportUpdateArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TurfSports.
     * @param {TurfSportDeleteManyArgs} args - Arguments to filter TurfSports to delete.
     * @example
     * // Delete a few TurfSports
     * const { count } = await prisma.turfSport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TurfSportDeleteManyArgs>(args?: SelectSubset<T, TurfSportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TurfSports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TurfSports
     * const turfSport = await prisma.turfSport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TurfSportUpdateManyArgs>(args: SelectSubset<T, TurfSportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TurfSports and returns the data updated in the database.
     * @param {TurfSportUpdateManyAndReturnArgs} args - Arguments to update many TurfSports.
     * @example
     * // Update many TurfSports
     * const turfSport = await prisma.turfSport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TurfSports and only return the `turfId`
     * const turfSportWithTurfIdOnly = await prisma.turfSport.updateManyAndReturn({
     *   select: { turfId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TurfSportUpdateManyAndReturnArgs>(args: SelectSubset<T, TurfSportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TurfSport.
     * @param {TurfSportUpsertArgs} args - Arguments to update or create a TurfSport.
     * @example
     * // Update or create a TurfSport
     * const turfSport = await prisma.turfSport.upsert({
     *   create: {
     *     // ... data to create a TurfSport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TurfSport we want to update
     *   }
     * })
     */
    upsert<T extends TurfSportUpsertArgs>(args: SelectSubset<T, TurfSportUpsertArgs<ExtArgs>>): Prisma__TurfSportClient<$Result.GetResult<Prisma.$TurfSportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TurfSports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportCountArgs} args - Arguments to filter TurfSports to count.
     * @example
     * // Count the number of TurfSports
     * const count = await prisma.turfSport.count({
     *   where: {
     *     // ... the filter for the TurfSports we want to count
     *   }
     * })
    **/
    count<T extends TurfSportCountArgs>(
      args?: Subset<T, TurfSportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TurfSportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TurfSport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TurfSportAggregateArgs>(args: Subset<T, TurfSportAggregateArgs>): Prisma.PrismaPromise<GetTurfSportAggregateType<T>>

    /**
     * Group by TurfSport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TurfSportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TurfSportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TurfSportGroupByArgs['orderBy'] }
        : { orderBy?: TurfSportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TurfSportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTurfSportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TurfSport model
   */
  readonly fields: TurfSportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TurfSport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TurfSportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    turf<T extends TurfDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TurfDefaultArgs<ExtArgs>>): Prisma__TurfClient<$Result.GetResult<Prisma.$TurfPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    sport<T extends SportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SportDefaultArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TurfSport model
   */
  interface TurfSportFieldRefs {
    readonly turfId: FieldRef<"TurfSport", 'String'>
    readonly sportId: FieldRef<"TurfSport", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TurfSport findUnique
   */
  export type TurfSportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter, which TurfSport to fetch.
     */
    where: TurfSportWhereUniqueInput
  }

  /**
   * TurfSport findUniqueOrThrow
   */
  export type TurfSportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter, which TurfSport to fetch.
     */
    where: TurfSportWhereUniqueInput
  }

  /**
   * TurfSport findFirst
   */
  export type TurfSportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter, which TurfSport to fetch.
     */
    where?: TurfSportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TurfSports to fetch.
     */
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TurfSports.
     */
    cursor?: TurfSportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TurfSports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TurfSports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TurfSports.
     */
    distinct?: TurfSportScalarFieldEnum | TurfSportScalarFieldEnum[]
  }

  /**
   * TurfSport findFirstOrThrow
   */
  export type TurfSportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter, which TurfSport to fetch.
     */
    where?: TurfSportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TurfSports to fetch.
     */
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TurfSports.
     */
    cursor?: TurfSportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TurfSports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TurfSports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TurfSports.
     */
    distinct?: TurfSportScalarFieldEnum | TurfSportScalarFieldEnum[]
  }

  /**
   * TurfSport findMany
   */
  export type TurfSportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter, which TurfSports to fetch.
     */
    where?: TurfSportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TurfSports to fetch.
     */
    orderBy?: TurfSportOrderByWithRelationInput | TurfSportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TurfSports.
     */
    cursor?: TurfSportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TurfSports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TurfSports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TurfSports.
     */
    distinct?: TurfSportScalarFieldEnum | TurfSportScalarFieldEnum[]
  }

  /**
   * TurfSport create
   */
  export type TurfSportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * The data needed to create a TurfSport.
     */
    data: XOR<TurfSportCreateInput, TurfSportUncheckedCreateInput>
  }

  /**
   * TurfSport createMany
   */
  export type TurfSportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TurfSports.
     */
    data: TurfSportCreateManyInput | TurfSportCreateManyInput[]
  }

  /**
   * TurfSport createManyAndReturn
   */
  export type TurfSportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * The data used to create many TurfSports.
     */
    data: TurfSportCreateManyInput | TurfSportCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TurfSport update
   */
  export type TurfSportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * The data needed to update a TurfSport.
     */
    data: XOR<TurfSportUpdateInput, TurfSportUncheckedUpdateInput>
    /**
     * Choose, which TurfSport to update.
     */
    where: TurfSportWhereUniqueInput
  }

  /**
   * TurfSport updateMany
   */
  export type TurfSportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TurfSports.
     */
    data: XOR<TurfSportUpdateManyMutationInput, TurfSportUncheckedUpdateManyInput>
    /**
     * Filter which TurfSports to update
     */
    where?: TurfSportWhereInput
    /**
     * Limit how many TurfSports to update.
     */
    limit?: number
  }

  /**
   * TurfSport updateManyAndReturn
   */
  export type TurfSportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * The data used to update TurfSports.
     */
    data: XOR<TurfSportUpdateManyMutationInput, TurfSportUncheckedUpdateManyInput>
    /**
     * Filter which TurfSports to update
     */
    where?: TurfSportWhereInput
    /**
     * Limit how many TurfSports to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TurfSport upsert
   */
  export type TurfSportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * The filter to search for the TurfSport to update in case it exists.
     */
    where: TurfSportWhereUniqueInput
    /**
     * In case the TurfSport found by the `where` argument doesn't exist, create a new TurfSport with this data.
     */
    create: XOR<TurfSportCreateInput, TurfSportUncheckedCreateInput>
    /**
     * In case the TurfSport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TurfSportUpdateInput, TurfSportUncheckedUpdateInput>
  }

  /**
   * TurfSport delete
   */
  export type TurfSportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
    /**
     * Filter which TurfSport to delete.
     */
    where: TurfSportWhereUniqueInput
  }

  /**
   * TurfSport deleteMany
   */
  export type TurfSportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TurfSports to delete
     */
    where?: TurfSportWhereInput
    /**
     * Limit how many TurfSports to delete.
     */
    limit?: number
  }

  /**
   * TurfSport without action
   */
  export type TurfSportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TurfSport
     */
    select?: TurfSportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TurfSport
     */
    omit?: TurfSportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TurfSportInclude<ExtArgs> | null
  }


  /**
   * Model MembershipPlan
   */

  export type AggregateMembershipPlan = {
    _count: MembershipPlanCountAggregateOutputType | null
    _avg: MembershipPlanAvgAggregateOutputType | null
    _sum: MembershipPlanSumAggregateOutputType | null
    _min: MembershipPlanMinAggregateOutputType | null
    _max: MembershipPlanMaxAggregateOutputType | null
  }

  export type MembershipPlanAvgAggregateOutputType = {
    durationInDays: number | null
    price: number | null
    slotsPerDay: number | null
  }

  export type MembershipPlanSumAggregateOutputType = {
    durationInDays: number | null
    price: number | null
    slotsPerDay: number | null
  }

  export type MembershipPlanMinAggregateOutputType = {
    id: string | null
    name: string | null
    sportId: string | null
    durationInDays: number | null
    price: number | null
    slotsPerDay: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipPlanMaxAggregateOutputType = {
    id: string | null
    name: string | null
    sportId: string | null
    durationInDays: number | null
    price: number | null
    slotsPerDay: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipPlanCountAggregateOutputType = {
    id: number
    name: number
    sportId: number
    durationInDays: number
    price: number
    slotsPerDay: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MembershipPlanAvgAggregateInputType = {
    durationInDays?: true
    price?: true
    slotsPerDay?: true
  }

  export type MembershipPlanSumAggregateInputType = {
    durationInDays?: true
    price?: true
    slotsPerDay?: true
  }

  export type MembershipPlanMinAggregateInputType = {
    id?: true
    name?: true
    sportId?: true
    durationInDays?: true
    price?: true
    slotsPerDay?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipPlanMaxAggregateInputType = {
    id?: true
    name?: true
    sportId?: true
    durationInDays?: true
    price?: true
    slotsPerDay?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipPlanCountAggregateInputType = {
    id?: true
    name?: true
    sportId?: true
    durationInDays?: true
    price?: true
    slotsPerDay?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MembershipPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipPlan to aggregate.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MembershipPlans
    **/
    _count?: true | MembershipPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MembershipPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MembershipPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MembershipPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MembershipPlanMaxAggregateInputType
  }

  export type GetMembershipPlanAggregateType<T extends MembershipPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateMembershipPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMembershipPlan[P]>
      : GetScalarType<T[P], AggregateMembershipPlan[P]>
  }




  export type MembershipPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipPlanWhereInput
    orderBy?: MembershipPlanOrderByWithAggregationInput | MembershipPlanOrderByWithAggregationInput[]
    by: MembershipPlanScalarFieldEnum[] | MembershipPlanScalarFieldEnum
    having?: MembershipPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MembershipPlanCountAggregateInputType | true
    _avg?: MembershipPlanAvgAggregateInputType
    _sum?: MembershipPlanSumAggregateInputType
    _min?: MembershipPlanMinAggregateInputType
    _max?: MembershipPlanMaxAggregateInputType
  }

  export type MembershipPlanGroupByOutputType = {
    id: string
    name: string
    sportId: string
    durationInDays: number
    price: number
    slotsPerDay: number
    createdAt: Date
    updatedAt: Date
    _count: MembershipPlanCountAggregateOutputType | null
    _avg: MembershipPlanAvgAggregateOutputType | null
    _sum: MembershipPlanSumAggregateOutputType | null
    _min: MembershipPlanMinAggregateOutputType | null
    _max: MembershipPlanMaxAggregateOutputType | null
  }

  type GetMembershipPlanGroupByPayload<T extends MembershipPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MembershipPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MembershipPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MembershipPlanGroupByOutputType[P]>
            : GetScalarType<T[P], MembershipPlanGroupByOutputType[P]>
        }
      >
    >


  export type MembershipPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sportId?: boolean
    durationInDays?: boolean
    price?: boolean
    slotsPerDay?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sport?: boolean | SportDefaultArgs<ExtArgs>
    memberships?: boolean | MembershipPlan$membershipsArgs<ExtArgs>
    attendances?: boolean | MembershipPlan$attendancesArgs<ExtArgs>
    _count?: boolean | MembershipPlanCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sportId?: boolean
    durationInDays?: boolean
    price?: boolean
    slotsPerDay?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sportId?: boolean
    durationInDays?: boolean
    price?: boolean
    slotsPerDay?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectScalar = {
    id?: boolean
    name?: boolean
    sportId?: boolean
    durationInDays?: boolean
    price?: boolean
    slotsPerDay?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MembershipPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "sportId" | "durationInDays" | "price" | "slotsPerDay" | "createdAt" | "updatedAt", ExtArgs["result"]["membershipPlan"]>
  export type MembershipPlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sport?: boolean | SportDefaultArgs<ExtArgs>
    memberships?: boolean | MembershipPlan$membershipsArgs<ExtArgs>
    attendances?: boolean | MembershipPlan$attendancesArgs<ExtArgs>
    _count?: boolean | MembershipPlanCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MembershipPlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }
  export type MembershipPlanIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sport?: boolean | SportDefaultArgs<ExtArgs>
  }

  export type $MembershipPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MembershipPlan"
    objects: {
      sport: Prisma.$SportPayload<ExtArgs>
      memberships: Prisma.$MemberMembershipPayload<ExtArgs>[]
      attendances: Prisma.$AttendancePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      sportId: string
      durationInDays: number
      price: number
      slotsPerDay: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["membershipPlan"]>
    composites: {}
  }

  type MembershipPlanGetPayload<S extends boolean | null | undefined | MembershipPlanDefaultArgs> = $Result.GetResult<Prisma.$MembershipPlanPayload, S>

  type MembershipPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MembershipPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MembershipPlanCountAggregateInputType | true
    }

  export interface MembershipPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MembershipPlan'], meta: { name: 'MembershipPlan' } }
    /**
     * Find zero or one MembershipPlan that matches the filter.
     * @param {MembershipPlanFindUniqueArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MembershipPlanFindUniqueArgs>(args: SelectSubset<T, MembershipPlanFindUniqueArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MembershipPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MembershipPlanFindUniqueOrThrowArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MembershipPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, MembershipPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindFirstArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MembershipPlanFindFirstArgs>(args?: SelectSubset<T, MembershipPlanFindFirstArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindFirstOrThrowArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MembershipPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, MembershipPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MembershipPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MembershipPlans
     * const membershipPlans = await prisma.membershipPlan.findMany()
     * 
     * // Get first 10 MembershipPlans
     * const membershipPlans = await prisma.membershipPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MembershipPlanFindManyArgs>(args?: SelectSubset<T, MembershipPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MembershipPlan.
     * @param {MembershipPlanCreateArgs} args - Arguments to create a MembershipPlan.
     * @example
     * // Create one MembershipPlan
     * const MembershipPlan = await prisma.membershipPlan.create({
     *   data: {
     *     // ... data to create a MembershipPlan
     *   }
     * })
     * 
     */
    create<T extends MembershipPlanCreateArgs>(args: SelectSubset<T, MembershipPlanCreateArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MembershipPlans.
     * @param {MembershipPlanCreateManyArgs} args - Arguments to create many MembershipPlans.
     * @example
     * // Create many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MembershipPlanCreateManyArgs>(args?: SelectSubset<T, MembershipPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MembershipPlans and returns the data saved in the database.
     * @param {MembershipPlanCreateManyAndReturnArgs} args - Arguments to create many MembershipPlans.
     * @example
     * // Create many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MembershipPlans and only return the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MembershipPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, MembershipPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MembershipPlan.
     * @param {MembershipPlanDeleteArgs} args - Arguments to delete one MembershipPlan.
     * @example
     * // Delete one MembershipPlan
     * const MembershipPlan = await prisma.membershipPlan.delete({
     *   where: {
     *     // ... filter to delete one MembershipPlan
     *   }
     * })
     * 
     */
    delete<T extends MembershipPlanDeleteArgs>(args: SelectSubset<T, MembershipPlanDeleteArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MembershipPlan.
     * @param {MembershipPlanUpdateArgs} args - Arguments to update one MembershipPlan.
     * @example
     * // Update one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MembershipPlanUpdateArgs>(args: SelectSubset<T, MembershipPlanUpdateArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MembershipPlans.
     * @param {MembershipPlanDeleteManyArgs} args - Arguments to filter MembershipPlans to delete.
     * @example
     * // Delete a few MembershipPlans
     * const { count } = await prisma.membershipPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MembershipPlanDeleteManyArgs>(args?: SelectSubset<T, MembershipPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MembershipPlanUpdateManyArgs>(args: SelectSubset<T, MembershipPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipPlans and returns the data updated in the database.
     * @param {MembershipPlanUpdateManyAndReturnArgs} args - Arguments to update many MembershipPlans.
     * @example
     * // Update many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MembershipPlans and only return the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MembershipPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, MembershipPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MembershipPlan.
     * @param {MembershipPlanUpsertArgs} args - Arguments to update or create a MembershipPlan.
     * @example
     * // Update or create a MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.upsert({
     *   create: {
     *     // ... data to create a MembershipPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MembershipPlan we want to update
     *   }
     * })
     */
    upsert<T extends MembershipPlanUpsertArgs>(args: SelectSubset<T, MembershipPlanUpsertArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MembershipPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanCountArgs} args - Arguments to filter MembershipPlans to count.
     * @example
     * // Count the number of MembershipPlans
     * const count = await prisma.membershipPlan.count({
     *   where: {
     *     // ... the filter for the MembershipPlans we want to count
     *   }
     * })
    **/
    count<T extends MembershipPlanCountArgs>(
      args?: Subset<T, MembershipPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MembershipPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MembershipPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MembershipPlanAggregateArgs>(args: Subset<T, MembershipPlanAggregateArgs>): Prisma.PrismaPromise<GetMembershipPlanAggregateType<T>>

    /**
     * Group by MembershipPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MembershipPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MembershipPlanGroupByArgs['orderBy'] }
        : { orderBy?: MembershipPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MembershipPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMembershipPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MembershipPlan model
   */
  readonly fields: MembershipPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MembershipPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MembershipPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sport<T extends SportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SportDefaultArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    memberships<T extends MembershipPlan$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, MembershipPlan$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    attendances<T extends MembershipPlan$attendancesArgs<ExtArgs> = {}>(args?: Subset<T, MembershipPlan$attendancesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MembershipPlan model
   */
  interface MembershipPlanFieldRefs {
    readonly id: FieldRef<"MembershipPlan", 'String'>
    readonly name: FieldRef<"MembershipPlan", 'String'>
    readonly sportId: FieldRef<"MembershipPlan", 'String'>
    readonly durationInDays: FieldRef<"MembershipPlan", 'Int'>
    readonly price: FieldRef<"MembershipPlan", 'Float'>
    readonly slotsPerDay: FieldRef<"MembershipPlan", 'Int'>
    readonly createdAt: FieldRef<"MembershipPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"MembershipPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MembershipPlan findUnique
   */
  export type MembershipPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan findUniqueOrThrow
   */
  export type MembershipPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan findFirst
   */
  export type MembershipPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipPlans.
     */
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan findFirstOrThrow
   */
  export type MembershipPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipPlans.
     */
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan findMany
   */
  export type MembershipPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter, which MembershipPlans to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipPlans.
     */
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan create
   */
  export type MembershipPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * The data needed to create a MembershipPlan.
     */
    data: XOR<MembershipPlanCreateInput, MembershipPlanUncheckedCreateInput>
  }

  /**
   * MembershipPlan createMany
   */
  export type MembershipPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MembershipPlans.
     */
    data: MembershipPlanCreateManyInput | MembershipPlanCreateManyInput[]
  }

  /**
   * MembershipPlan createManyAndReturn
   */
  export type MembershipPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data used to create many MembershipPlans.
     */
    data: MembershipPlanCreateManyInput | MembershipPlanCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MembershipPlan update
   */
  export type MembershipPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * The data needed to update a MembershipPlan.
     */
    data: XOR<MembershipPlanUpdateInput, MembershipPlanUncheckedUpdateInput>
    /**
     * Choose, which MembershipPlan to update.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan updateMany
   */
  export type MembershipPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MembershipPlans.
     */
    data: XOR<MembershipPlanUpdateManyMutationInput, MembershipPlanUncheckedUpdateManyInput>
    /**
     * Filter which MembershipPlans to update
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to update.
     */
    limit?: number
  }

  /**
   * MembershipPlan updateManyAndReturn
   */
  export type MembershipPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data used to update MembershipPlans.
     */
    data: XOR<MembershipPlanUpdateManyMutationInput, MembershipPlanUncheckedUpdateManyInput>
    /**
     * Filter which MembershipPlans to update
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MembershipPlan upsert
   */
  export type MembershipPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * The filter to search for the MembershipPlan to update in case it exists.
     */
    where: MembershipPlanWhereUniqueInput
    /**
     * In case the MembershipPlan found by the `where` argument doesn't exist, create a new MembershipPlan with this data.
     */
    create: XOR<MembershipPlanCreateInput, MembershipPlanUncheckedCreateInput>
    /**
     * In case the MembershipPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MembershipPlanUpdateInput, MembershipPlanUncheckedUpdateInput>
  }

  /**
   * MembershipPlan delete
   */
  export type MembershipPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    /**
     * Filter which MembershipPlan to delete.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan deleteMany
   */
  export type MembershipPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipPlans to delete
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to delete.
     */
    limit?: number
  }

  /**
   * MembershipPlan.memberships
   */
  export type MembershipPlan$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    where?: MemberMembershipWhereInput
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    cursor?: MemberMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberMembershipScalarFieldEnum | MemberMembershipScalarFieldEnum[]
  }

  /**
   * MembershipPlan.attendances
   */
  export type MembershipPlan$attendancesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    cursor?: AttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * MembershipPlan without action
   */
  export type MembershipPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
  }


  /**
   * Model MemberMembership
   */

  export type AggregateMemberMembership = {
    _count: MemberMembershipCountAggregateOutputType | null
    _min: MemberMembershipMinAggregateOutputType | null
    _max: MemberMembershipMaxAggregateOutputType | null
  }

  export type MemberMembershipMinAggregateOutputType = {
    id: string | null
    memberId: string | null
    membershipPlanId: string | null
    startDate: Date | null
    endDate: Date | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MemberMembershipMaxAggregateOutputType = {
    id: string | null
    memberId: string | null
    membershipPlanId: string | null
    startDate: Date | null
    endDate: Date | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MemberMembershipCountAggregateOutputType = {
    id: number
    memberId: number
    membershipPlanId: number
    startDate: number
    endDate: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MemberMembershipMinAggregateInputType = {
    id?: true
    memberId?: true
    membershipPlanId?: true
    startDate?: true
    endDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MemberMembershipMaxAggregateInputType = {
    id?: true
    memberId?: true
    membershipPlanId?: true
    startDate?: true
    endDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MemberMembershipCountAggregateInputType = {
    id?: true
    memberId?: true
    membershipPlanId?: true
    startDate?: true
    endDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MemberMembershipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemberMembership to aggregate.
     */
    where?: MemberMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberMemberships to fetch.
     */
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemberMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemberMemberships
    **/
    _count?: true | MemberMembershipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemberMembershipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemberMembershipMaxAggregateInputType
  }

  export type GetMemberMembershipAggregateType<T extends MemberMembershipAggregateArgs> = {
        [P in keyof T & keyof AggregateMemberMembership]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemberMembership[P]>
      : GetScalarType<T[P], AggregateMemberMembership[P]>
  }




  export type MemberMembershipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberMembershipWhereInput
    orderBy?: MemberMembershipOrderByWithAggregationInput | MemberMembershipOrderByWithAggregationInput[]
    by: MemberMembershipScalarFieldEnum[] | MemberMembershipScalarFieldEnum
    having?: MemberMembershipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemberMembershipCountAggregateInputType | true
    _min?: MemberMembershipMinAggregateInputType
    _max?: MemberMembershipMaxAggregateInputType
  }

  export type MemberMembershipGroupByOutputType = {
    id: string
    memberId: string
    membershipPlanId: string
    startDate: Date
    endDate: Date
    status: string
    createdAt: Date
    updatedAt: Date
    _count: MemberMembershipCountAggregateOutputType | null
    _min: MemberMembershipMinAggregateOutputType | null
    _max: MemberMembershipMaxAggregateOutputType | null
  }

  type GetMemberMembershipGroupByPayload<T extends MemberMembershipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemberMembershipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemberMembershipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemberMembershipGroupByOutputType[P]>
            : GetScalarType<T[P], MemberMembershipGroupByOutputType[P]>
        }
      >
    >


  export type MemberMembershipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    membershipPlanId?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberMembership"]>

  export type MemberMembershipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    membershipPlanId?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberMembership"]>

  export type MemberMembershipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    membershipPlanId?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberMembership"]>

  export type MemberMembershipSelectScalar = {
    id?: boolean
    memberId?: boolean
    membershipPlanId?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MemberMembershipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "memberId" | "membershipPlanId" | "startDate" | "endDate" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["memberMembership"]>
  export type MemberMembershipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }
  export type MemberMembershipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }
  export type MemberMembershipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    membershipPlan?: boolean | MembershipPlanDefaultArgs<ExtArgs>
  }

  export type $MemberMembershipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemberMembership"
    objects: {
      member: Prisma.$MemberPayload<ExtArgs>
      membershipPlan: Prisma.$MembershipPlanPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      memberId: string
      membershipPlanId: string
      startDate: Date
      endDate: Date
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["memberMembership"]>
    composites: {}
  }

  type MemberMembershipGetPayload<S extends boolean | null | undefined | MemberMembershipDefaultArgs> = $Result.GetResult<Prisma.$MemberMembershipPayload, S>

  type MemberMembershipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemberMembershipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemberMembershipCountAggregateInputType | true
    }

  export interface MemberMembershipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemberMembership'], meta: { name: 'MemberMembership' } }
    /**
     * Find zero or one MemberMembership that matches the filter.
     * @param {MemberMembershipFindUniqueArgs} args - Arguments to find a MemberMembership
     * @example
     * // Get one MemberMembership
     * const memberMembership = await prisma.memberMembership.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemberMembershipFindUniqueArgs>(args: SelectSubset<T, MemberMembershipFindUniqueArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemberMembership that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemberMembershipFindUniqueOrThrowArgs} args - Arguments to find a MemberMembership
     * @example
     * // Get one MemberMembership
     * const memberMembership = await prisma.memberMembership.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemberMembershipFindUniqueOrThrowArgs>(args: SelectSubset<T, MemberMembershipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemberMembership that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipFindFirstArgs} args - Arguments to find a MemberMembership
     * @example
     * // Get one MemberMembership
     * const memberMembership = await prisma.memberMembership.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemberMembershipFindFirstArgs>(args?: SelectSubset<T, MemberMembershipFindFirstArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemberMembership that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipFindFirstOrThrowArgs} args - Arguments to find a MemberMembership
     * @example
     * // Get one MemberMembership
     * const memberMembership = await prisma.memberMembership.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemberMembershipFindFirstOrThrowArgs>(args?: SelectSubset<T, MemberMembershipFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemberMemberships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemberMemberships
     * const memberMemberships = await prisma.memberMembership.findMany()
     * 
     * // Get first 10 MemberMemberships
     * const memberMemberships = await prisma.memberMembership.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memberMembershipWithIdOnly = await prisma.memberMembership.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemberMembershipFindManyArgs>(args?: SelectSubset<T, MemberMembershipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemberMembership.
     * @param {MemberMembershipCreateArgs} args - Arguments to create a MemberMembership.
     * @example
     * // Create one MemberMembership
     * const MemberMembership = await prisma.memberMembership.create({
     *   data: {
     *     // ... data to create a MemberMembership
     *   }
     * })
     * 
     */
    create<T extends MemberMembershipCreateArgs>(args: SelectSubset<T, MemberMembershipCreateArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemberMemberships.
     * @param {MemberMembershipCreateManyArgs} args - Arguments to create many MemberMemberships.
     * @example
     * // Create many MemberMemberships
     * const memberMembership = await prisma.memberMembership.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemberMembershipCreateManyArgs>(args?: SelectSubset<T, MemberMembershipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemberMemberships and returns the data saved in the database.
     * @param {MemberMembershipCreateManyAndReturnArgs} args - Arguments to create many MemberMemberships.
     * @example
     * // Create many MemberMemberships
     * const memberMembership = await prisma.memberMembership.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemberMemberships and only return the `id`
     * const memberMembershipWithIdOnly = await prisma.memberMembership.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemberMembershipCreateManyAndReturnArgs>(args?: SelectSubset<T, MemberMembershipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemberMembership.
     * @param {MemberMembershipDeleteArgs} args - Arguments to delete one MemberMembership.
     * @example
     * // Delete one MemberMembership
     * const MemberMembership = await prisma.memberMembership.delete({
     *   where: {
     *     // ... filter to delete one MemberMembership
     *   }
     * })
     * 
     */
    delete<T extends MemberMembershipDeleteArgs>(args: SelectSubset<T, MemberMembershipDeleteArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemberMembership.
     * @param {MemberMembershipUpdateArgs} args - Arguments to update one MemberMembership.
     * @example
     * // Update one MemberMembership
     * const memberMembership = await prisma.memberMembership.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemberMembershipUpdateArgs>(args: SelectSubset<T, MemberMembershipUpdateArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemberMemberships.
     * @param {MemberMembershipDeleteManyArgs} args - Arguments to filter MemberMemberships to delete.
     * @example
     * // Delete a few MemberMemberships
     * const { count } = await prisma.memberMembership.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemberMembershipDeleteManyArgs>(args?: SelectSubset<T, MemberMembershipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemberMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemberMemberships
     * const memberMembership = await prisma.memberMembership.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemberMembershipUpdateManyArgs>(args: SelectSubset<T, MemberMembershipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemberMemberships and returns the data updated in the database.
     * @param {MemberMembershipUpdateManyAndReturnArgs} args - Arguments to update many MemberMemberships.
     * @example
     * // Update many MemberMemberships
     * const memberMembership = await prisma.memberMembership.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemberMemberships and only return the `id`
     * const memberMembershipWithIdOnly = await prisma.memberMembership.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemberMembershipUpdateManyAndReturnArgs>(args: SelectSubset<T, MemberMembershipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemberMembership.
     * @param {MemberMembershipUpsertArgs} args - Arguments to update or create a MemberMembership.
     * @example
     * // Update or create a MemberMembership
     * const memberMembership = await prisma.memberMembership.upsert({
     *   create: {
     *     // ... data to create a MemberMembership
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemberMembership we want to update
     *   }
     * })
     */
    upsert<T extends MemberMembershipUpsertArgs>(args: SelectSubset<T, MemberMembershipUpsertArgs<ExtArgs>>): Prisma__MemberMembershipClient<$Result.GetResult<Prisma.$MemberMembershipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemberMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipCountArgs} args - Arguments to filter MemberMemberships to count.
     * @example
     * // Count the number of MemberMemberships
     * const count = await prisma.memberMembership.count({
     *   where: {
     *     // ... the filter for the MemberMemberships we want to count
     *   }
     * })
    **/
    count<T extends MemberMembershipCountArgs>(
      args?: Subset<T, MemberMembershipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemberMembershipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemberMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemberMembershipAggregateArgs>(args: Subset<T, MemberMembershipAggregateArgs>): Prisma.PrismaPromise<GetMemberMembershipAggregateType<T>>

    /**
     * Group by MemberMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberMembershipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemberMembershipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemberMembershipGroupByArgs['orderBy'] }
        : { orderBy?: MemberMembershipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemberMembershipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemberMembershipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemberMembership model
   */
  readonly fields: MemberMembershipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemberMembership.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemberMembershipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    member<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    membershipPlan<T extends MembershipPlanDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MembershipPlanDefaultArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemberMembership model
   */
  interface MemberMembershipFieldRefs {
    readonly id: FieldRef<"MemberMembership", 'String'>
    readonly memberId: FieldRef<"MemberMembership", 'String'>
    readonly membershipPlanId: FieldRef<"MemberMembership", 'String'>
    readonly startDate: FieldRef<"MemberMembership", 'DateTime'>
    readonly endDate: FieldRef<"MemberMembership", 'DateTime'>
    readonly status: FieldRef<"MemberMembership", 'String'>
    readonly createdAt: FieldRef<"MemberMembership", 'DateTime'>
    readonly updatedAt: FieldRef<"MemberMembership", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MemberMembership findUnique
   */
  export type MemberMembershipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter, which MemberMembership to fetch.
     */
    where: MemberMembershipWhereUniqueInput
  }

  /**
   * MemberMembership findUniqueOrThrow
   */
  export type MemberMembershipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter, which MemberMembership to fetch.
     */
    where: MemberMembershipWhereUniqueInput
  }

  /**
   * MemberMembership findFirst
   */
  export type MemberMembershipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter, which MemberMembership to fetch.
     */
    where?: MemberMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberMemberships to fetch.
     */
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemberMemberships.
     */
    cursor?: MemberMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemberMemberships.
     */
    distinct?: MemberMembershipScalarFieldEnum | MemberMembershipScalarFieldEnum[]
  }

  /**
   * MemberMembership findFirstOrThrow
   */
  export type MemberMembershipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter, which MemberMembership to fetch.
     */
    where?: MemberMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberMemberships to fetch.
     */
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemberMemberships.
     */
    cursor?: MemberMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemberMemberships.
     */
    distinct?: MemberMembershipScalarFieldEnum | MemberMembershipScalarFieldEnum[]
  }

  /**
   * MemberMembership findMany
   */
  export type MemberMembershipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter, which MemberMemberships to fetch.
     */
    where?: MemberMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberMemberships to fetch.
     */
    orderBy?: MemberMembershipOrderByWithRelationInput | MemberMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemberMemberships.
     */
    cursor?: MemberMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemberMemberships.
     */
    distinct?: MemberMembershipScalarFieldEnum | MemberMembershipScalarFieldEnum[]
  }

  /**
   * MemberMembership create
   */
  export type MemberMembershipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * The data needed to create a MemberMembership.
     */
    data: XOR<MemberMembershipCreateInput, MemberMembershipUncheckedCreateInput>
  }

  /**
   * MemberMembership createMany
   */
  export type MemberMembershipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemberMemberships.
     */
    data: MemberMembershipCreateManyInput | MemberMembershipCreateManyInput[]
  }

  /**
   * MemberMembership createManyAndReturn
   */
  export type MemberMembershipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * The data used to create many MemberMemberships.
     */
    data: MemberMembershipCreateManyInput | MemberMembershipCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemberMembership update
   */
  export type MemberMembershipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * The data needed to update a MemberMembership.
     */
    data: XOR<MemberMembershipUpdateInput, MemberMembershipUncheckedUpdateInput>
    /**
     * Choose, which MemberMembership to update.
     */
    where: MemberMembershipWhereUniqueInput
  }

  /**
   * MemberMembership updateMany
   */
  export type MemberMembershipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemberMemberships.
     */
    data: XOR<MemberMembershipUpdateManyMutationInput, MemberMembershipUncheckedUpdateManyInput>
    /**
     * Filter which MemberMemberships to update
     */
    where?: MemberMembershipWhereInput
    /**
     * Limit how many MemberMemberships to update.
     */
    limit?: number
  }

  /**
   * MemberMembership updateManyAndReturn
   */
  export type MemberMembershipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * The data used to update MemberMemberships.
     */
    data: XOR<MemberMembershipUpdateManyMutationInput, MemberMembershipUncheckedUpdateManyInput>
    /**
     * Filter which MemberMemberships to update
     */
    where?: MemberMembershipWhereInput
    /**
     * Limit how many MemberMemberships to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemberMembership upsert
   */
  export type MemberMembershipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * The filter to search for the MemberMembership to update in case it exists.
     */
    where: MemberMembershipWhereUniqueInput
    /**
     * In case the MemberMembership found by the `where` argument doesn't exist, create a new MemberMembership with this data.
     */
    create: XOR<MemberMembershipCreateInput, MemberMembershipUncheckedCreateInput>
    /**
     * In case the MemberMembership was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemberMembershipUpdateInput, MemberMembershipUncheckedUpdateInput>
  }

  /**
   * MemberMembership delete
   */
  export type MemberMembershipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
    /**
     * Filter which MemberMembership to delete.
     */
    where: MemberMembershipWhereUniqueInput
  }

  /**
   * MemberMembership deleteMany
   */
  export type MemberMembershipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemberMemberships to delete
     */
    where?: MemberMembershipWhereInput
    /**
     * Limit how many MemberMemberships to delete.
     */
    limit?: number
  }

  /**
   * MemberMembership without action
   */
  export type MemberMembershipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberMembership
     */
    select?: MemberMembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberMembership
     */
    omit?: MemberMembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberMembershipInclude<ExtArgs> | null
  }


  /**
   * Model Attendance
   */

  export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  export type AttendanceMinAggregateOutputType = {
    id: string | null
    memberId: string | null
    date: Date | null
    status: string | null
    sportId: string | null
    membershipPlanId: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type AttendanceMaxAggregateOutputType = {
    id: string | null
    memberId: string | null
    date: Date | null
    status: string | null
    sportId: string | null
    membershipPlanId: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type AttendanceCountAggregateOutputType = {
    id: number
    memberId: number
    date: number
    status: number
    sportId: number
    membershipPlanId: number
    notes: number
    createdAt: number
    _all: number
  }


  export type AttendanceMinAggregateInputType = {
    id?: true
    memberId?: true
    date?: true
    status?: true
    sportId?: true
    membershipPlanId?: true
    notes?: true
    createdAt?: true
  }

  export type AttendanceMaxAggregateInputType = {
    id?: true
    memberId?: true
    date?: true
    status?: true
    sportId?: true
    membershipPlanId?: true
    notes?: true
    createdAt?: true
  }

  export type AttendanceCountAggregateInputType = {
    id?: true
    memberId?: true
    date?: true
    status?: true
    sportId?: true
    membershipPlanId?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type AttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendance to aggregate.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attendances
    **/
    _count?: true | AttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttendanceMaxAggregateInputType
  }

  export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttendance[P]>
      : GetScalarType<T[P], AggregateAttendance[P]>
  }




  export type AttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithAggregationInput | AttendanceOrderByWithAggregationInput[]
    by: AttendanceScalarFieldEnum[] | AttendanceScalarFieldEnum
    having?: AttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttendanceCountAggregateInputType | true
    _min?: AttendanceMinAggregateInputType
    _max?: AttendanceMaxAggregateInputType
  }

  export type AttendanceGroupByOutputType = {
    id: string
    memberId: string
    date: Date
    status: string
    sportId: string | null
    membershipPlanId: string | null
    notes: string | null
    createdAt: Date
    _count: AttendanceCountAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
        }
      >
    >


  export type AttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    date?: boolean
    status?: boolean
    sportId?: boolean
    membershipPlanId?: boolean
    notes?: boolean
    createdAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    date?: boolean
    status?: boolean
    sportId?: boolean
    membershipPlanId?: boolean
    notes?: boolean
    createdAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    memberId?: boolean
    date?: boolean
    status?: boolean
    sportId?: boolean
    membershipPlanId?: boolean
    notes?: boolean
    createdAt?: boolean
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectScalar = {
    id?: boolean
    memberId?: boolean
    date?: boolean
    status?: boolean
    sportId?: boolean
    membershipPlanId?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type AttendanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "memberId" | "date" | "status" | "sportId" | "membershipPlanId" | "notes" | "createdAt", ExtArgs["result"]["attendance"]>
  export type AttendanceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }
  export type AttendanceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }
  export type AttendanceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    member?: boolean | MemberDefaultArgs<ExtArgs>
    sport?: boolean | Attendance$sportArgs<ExtArgs>
    membershipPlan?: boolean | Attendance$membershipPlanArgs<ExtArgs>
  }

  export type $AttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attendance"
    objects: {
      member: Prisma.$MemberPayload<ExtArgs>
      sport: Prisma.$SportPayload<ExtArgs> | null
      membershipPlan: Prisma.$MembershipPlanPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      memberId: string
      date: Date
      status: string
      sportId: string | null
      membershipPlanId: string | null
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["attendance"]>
    composites: {}
  }

  type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = $Result.GetResult<Prisma.$AttendancePayload, S>

  type AttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttendanceCountAggregateInputType | true
    }

  export interface AttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attendance'], meta: { name: 'Attendance' } }
    /**
     * Find zero or one Attendance that matches the filter.
     * @param {AttendanceFindUniqueArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttendanceFindUniqueArgs>(args: SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attendance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttendanceFindUniqueOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttendanceFindFirstArgs>(args?: SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attendances
     * const attendances = await prisma.attendance.findMany()
     * 
     * // Get first 10 Attendances
     * const attendances = await prisma.attendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attendanceWithIdOnly = await prisma.attendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttendanceFindManyArgs>(args?: SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attendance.
     * @param {AttendanceCreateArgs} args - Arguments to create a Attendance.
     * @example
     * // Create one Attendance
     * const Attendance = await prisma.attendance.create({
     *   data: {
     *     // ... data to create a Attendance
     *   }
     * })
     * 
     */
    create<T extends AttendanceCreateArgs>(args: SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attendances.
     * @param {AttendanceCreateManyArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttendanceCreateManyArgs>(args?: SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attendances and returns the data saved in the database.
     * @param {AttendanceCreateManyAndReturnArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attendances and only return the `id`
     * const attendanceWithIdOnly = await prisma.attendance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttendanceCreateManyAndReturnArgs>(args?: SelectSubset<T, AttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Attendance.
     * @param {AttendanceDeleteArgs} args - Arguments to delete one Attendance.
     * @example
     * // Delete one Attendance
     * const Attendance = await prisma.attendance.delete({
     *   where: {
     *     // ... filter to delete one Attendance
     *   }
     * })
     * 
     */
    delete<T extends AttendanceDeleteArgs>(args: SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attendance.
     * @param {AttendanceUpdateArgs} args - Arguments to update one Attendance.
     * @example
     * // Update one Attendance
     * const attendance = await prisma.attendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttendanceUpdateArgs>(args: SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attendances.
     * @param {AttendanceDeleteManyArgs} args - Arguments to filter Attendances to delete.
     * @example
     * // Delete a few Attendances
     * const { count } = await prisma.attendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttendanceUpdateManyArgs>(args: SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances and returns the data updated in the database.
     * @param {AttendanceUpdateManyAndReturnArgs} args - Arguments to update many Attendances.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Attendances and only return the `id`
     * const attendanceWithIdOnly = await prisma.attendance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AttendanceUpdateManyAndReturnArgs>(args: SelectSubset<T, AttendanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Attendance.
     * @param {AttendanceUpsertArgs} args - Arguments to update or create a Attendance.
     * @example
     * // Update or create a Attendance
     * const attendance = await prisma.attendance.upsert({
     *   create: {
     *     // ... data to create a Attendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attendance we want to update
     *   }
     * })
     */
    upsert<T extends AttendanceUpsertArgs>(args: SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceCountArgs} args - Arguments to filter Attendances to count.
     * @example
     * // Count the number of Attendances
     * const count = await prisma.attendance.count({
     *   where: {
     *     // ... the filter for the Attendances we want to count
     *   }
     * })
    **/
    count<T extends AttendanceCountArgs>(
      args?: Subset<T, AttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttendanceAggregateArgs>(args: Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>

    /**
     * Group by Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttendanceGroupByArgs['orderBy'] }
        : { orderBy?: AttendanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attendance model
   */
  readonly fields: AttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    member<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    sport<T extends Attendance$sportArgs<ExtArgs> = {}>(args?: Subset<T, Attendance$sportArgs<ExtArgs>>): Prisma__SportClient<$Result.GetResult<Prisma.$SportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    membershipPlan<T extends Attendance$membershipPlanArgs<ExtArgs> = {}>(args?: Subset<T, Attendance$membershipPlanArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attendance model
   */
  interface AttendanceFieldRefs {
    readonly id: FieldRef<"Attendance", 'String'>
    readonly memberId: FieldRef<"Attendance", 'String'>
    readonly date: FieldRef<"Attendance", 'DateTime'>
    readonly status: FieldRef<"Attendance", 'String'>
    readonly sportId: FieldRef<"Attendance", 'String'>
    readonly membershipPlanId: FieldRef<"Attendance", 'String'>
    readonly notes: FieldRef<"Attendance", 'String'>
    readonly createdAt: FieldRef<"Attendance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attendance findUnique
   */
  export type AttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findUniqueOrThrow
   */
  export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findFirst
   */
  export type AttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findFirstOrThrow
   */
  export type AttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findMany
   */
  export type AttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendances to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance create
   */
  export type AttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to create a Attendance.
     */
    data: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
  }

  /**
   * Attendance createMany
   */
  export type AttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
  }

  /**
   * Attendance createManyAndReturn
   */
  export type AttendanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attendance update
   */
  export type AttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to update a Attendance.
     */
    data: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
    /**
     * Choose, which Attendance to update.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance updateMany
   */
  export type AttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
  }

  /**
   * Attendance updateManyAndReturn
   */
  export type AttendanceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attendance upsert
   */
  export type AttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The filter to search for the Attendance to update in case it exists.
     */
    where: AttendanceWhereUniqueInput
    /**
     * In case the Attendance found by the `where` argument doesn't exist, create a new Attendance with this data.
     */
    create: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
    /**
     * In case the Attendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
  }

  /**
   * Attendance delete
   */
  export type AttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter which Attendance to delete.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance deleteMany
   */
  export type AttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendances to delete
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to delete.
     */
    limit?: number
  }

  /**
   * Attendance.sport
   */
  export type Attendance$sportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sport
     */
    select?: SportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sport
     */
    omit?: SportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SportInclude<ExtArgs> | null
    where?: SportWhereInput
  }

  /**
   * Attendance.membershipPlan
   */
  export type Attendance$membershipPlanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipPlanInclude<ExtArgs> | null
    where?: MembershipPlanWhereInput
  }

  /**
   * Attendance without action
   */
  export type AttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AdminScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdminScalarFieldEnum = (typeof AdminScalarFieldEnum)[keyof typeof AdminScalarFieldEnum]


  export const MemberScalarFieldEnum: {
    id: 'id',
    mobile: 'mobile',
    name: 'name',
    email: 'email',
    joinDate: 'joinDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MemberScalarFieldEnum = (typeof MemberScalarFieldEnum)[keyof typeof MemberScalarFieldEnum]


  export const SportScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SportScalarFieldEnum = (typeof SportScalarFieldEnum)[keyof typeof SportScalarFieldEnum]


  export const TurfScalarFieldEnum: {
    id: 'id',
    name: 'name',
    location: 'location',
    parentTurfId: 'parentTurfId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TurfScalarFieldEnum = (typeof TurfScalarFieldEnum)[keyof typeof TurfScalarFieldEnum]


  export const TurfSportScalarFieldEnum: {
    turfId: 'turfId',
    sportId: 'sportId'
  };

  export type TurfSportScalarFieldEnum = (typeof TurfSportScalarFieldEnum)[keyof typeof TurfSportScalarFieldEnum]


  export const MembershipPlanScalarFieldEnum: {
    id: 'id',
    name: 'name',
    sportId: 'sportId',
    durationInDays: 'durationInDays',
    price: 'price',
    slotsPerDay: 'slotsPerDay',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MembershipPlanScalarFieldEnum = (typeof MembershipPlanScalarFieldEnum)[keyof typeof MembershipPlanScalarFieldEnum]


  export const MemberMembershipScalarFieldEnum: {
    id: 'id',
    memberId: 'memberId',
    membershipPlanId: 'membershipPlanId',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MemberMembershipScalarFieldEnum = (typeof MemberMembershipScalarFieldEnum)[keyof typeof MemberMembershipScalarFieldEnum]


  export const AttendanceScalarFieldEnum: {
    id: 'id',
    memberId: 'memberId',
    date: 'date',
    status: 'status',
    sportId: 'sportId',
    membershipPlanId: 'membershipPlanId',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type AdminWhereInput = {
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    id?: StringFilter<"Admin"> | string
    email?: StringFilter<"Admin"> | string
    password?: StringFilter<"Admin"> | string
    name?: StringNullableFilter<"Admin"> | string | null
    createdAt?: DateTimeFilter<"Admin"> | Date | string
    updatedAt?: DateTimeFilter<"Admin"> | Date | string
  }

  export type AdminOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    password?: StringFilter<"Admin"> | string
    name?: StringNullableFilter<"Admin"> | string | null
    createdAt?: DateTimeFilter<"Admin"> | Date | string
    updatedAt?: DateTimeFilter<"Admin"> | Date | string
  }, "id" | "email">

  export type AdminOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdminCountOrderByAggregateInput
    _max?: AdminMaxOrderByAggregateInput
    _min?: AdminMinOrderByAggregateInput
  }

  export type AdminScalarWhereWithAggregatesInput = {
    AND?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    OR?: AdminScalarWhereWithAggregatesInput[]
    NOT?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Admin"> | string
    email?: StringWithAggregatesFilter<"Admin"> | string
    password?: StringWithAggregatesFilter<"Admin"> | string
    name?: StringNullableWithAggregatesFilter<"Admin"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Admin"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Admin"> | Date | string
  }

  export type MemberWhereInput = {
    AND?: MemberWhereInput | MemberWhereInput[]
    OR?: MemberWhereInput[]
    NOT?: MemberWhereInput | MemberWhereInput[]
    id?: StringFilter<"Member"> | string
    mobile?: StringFilter<"Member"> | string
    name?: StringFilter<"Member"> | string
    email?: StringNullableFilter<"Member"> | string | null
    joinDate?: DateTimeFilter<"Member"> | Date | string
    createdAt?: DateTimeFilter<"Member"> | Date | string
    updatedAt?: DateTimeFilter<"Member"> | Date | string
    memberships?: MemberMembershipListRelationFilter
    attendances?: AttendanceListRelationFilter
  }

  export type MemberOrderByWithRelationInput = {
    id?: SortOrder
    mobile?: SortOrder
    name?: SortOrder
    email?: SortOrderInput | SortOrder
    joinDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    memberships?: MemberMembershipOrderByRelationAggregateInput
    attendances?: AttendanceOrderByRelationAggregateInput
  }

  export type MemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    mobile?: string
    AND?: MemberWhereInput | MemberWhereInput[]
    OR?: MemberWhereInput[]
    NOT?: MemberWhereInput | MemberWhereInput[]
    name?: StringFilter<"Member"> | string
    email?: StringNullableFilter<"Member"> | string | null
    joinDate?: DateTimeFilter<"Member"> | Date | string
    createdAt?: DateTimeFilter<"Member"> | Date | string
    updatedAt?: DateTimeFilter<"Member"> | Date | string
    memberships?: MemberMembershipListRelationFilter
    attendances?: AttendanceListRelationFilter
  }, "id" | "mobile">

  export type MemberOrderByWithAggregationInput = {
    id?: SortOrder
    mobile?: SortOrder
    name?: SortOrder
    email?: SortOrderInput | SortOrder
    joinDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MemberCountOrderByAggregateInput
    _max?: MemberMaxOrderByAggregateInput
    _min?: MemberMinOrderByAggregateInput
  }

  export type MemberScalarWhereWithAggregatesInput = {
    AND?: MemberScalarWhereWithAggregatesInput | MemberScalarWhereWithAggregatesInput[]
    OR?: MemberScalarWhereWithAggregatesInput[]
    NOT?: MemberScalarWhereWithAggregatesInput | MemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Member"> | string
    mobile?: StringWithAggregatesFilter<"Member"> | string
    name?: StringWithAggregatesFilter<"Member"> | string
    email?: StringNullableWithAggregatesFilter<"Member"> | string | null
    joinDate?: DateTimeWithAggregatesFilter<"Member"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Member"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Member"> | Date | string
  }

  export type SportWhereInput = {
    AND?: SportWhereInput | SportWhereInput[]
    OR?: SportWhereInput[]
    NOT?: SportWhereInput | SportWhereInput[]
    id?: StringFilter<"Sport"> | string
    name?: StringFilter<"Sport"> | string
    description?: StringNullableFilter<"Sport"> | string | null
    createdAt?: DateTimeFilter<"Sport"> | Date | string
    updatedAt?: DateTimeFilter<"Sport"> | Date | string
    turfs?: TurfSportListRelationFilter
    membershipPlans?: MembershipPlanListRelationFilter
    attendances?: AttendanceListRelationFilter
  }

  export type SportOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    turfs?: TurfSportOrderByRelationAggregateInput
    membershipPlans?: MembershipPlanOrderByRelationAggregateInput
    attendances?: AttendanceOrderByRelationAggregateInput
  }

  export type SportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SportWhereInput | SportWhereInput[]
    OR?: SportWhereInput[]
    NOT?: SportWhereInput | SportWhereInput[]
    name?: StringFilter<"Sport"> | string
    description?: StringNullableFilter<"Sport"> | string | null
    createdAt?: DateTimeFilter<"Sport"> | Date | string
    updatedAt?: DateTimeFilter<"Sport"> | Date | string
    turfs?: TurfSportListRelationFilter
    membershipPlans?: MembershipPlanListRelationFilter
    attendances?: AttendanceListRelationFilter
  }, "id">

  export type SportOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SportCountOrderByAggregateInput
    _max?: SportMaxOrderByAggregateInput
    _min?: SportMinOrderByAggregateInput
  }

  export type SportScalarWhereWithAggregatesInput = {
    AND?: SportScalarWhereWithAggregatesInput | SportScalarWhereWithAggregatesInput[]
    OR?: SportScalarWhereWithAggregatesInput[]
    NOT?: SportScalarWhereWithAggregatesInput | SportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Sport"> | string
    name?: StringWithAggregatesFilter<"Sport"> | string
    description?: StringNullableWithAggregatesFilter<"Sport"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Sport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Sport"> | Date | string
  }

  export type TurfWhereInput = {
    AND?: TurfWhereInput | TurfWhereInput[]
    OR?: TurfWhereInput[]
    NOT?: TurfWhereInput | TurfWhereInput[]
    id?: StringFilter<"Turf"> | string
    name?: StringFilter<"Turf"> | string
    location?: StringNullableFilter<"Turf"> | string | null
    parentTurfId?: StringNullableFilter<"Turf"> | string | null
    createdAt?: DateTimeFilter<"Turf"> | Date | string
    updatedAt?: DateTimeFilter<"Turf"> | Date | string
    parentTurf?: XOR<TurfNullableScalarRelationFilter, TurfWhereInput> | null
    childTurfs?: TurfListRelationFilter
    sports?: TurfSportListRelationFilter
  }

  export type TurfOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrderInput | SortOrder
    parentTurfId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parentTurf?: TurfOrderByWithRelationInput
    childTurfs?: TurfOrderByRelationAggregateInput
    sports?: TurfSportOrderByRelationAggregateInput
  }

  export type TurfWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TurfWhereInput | TurfWhereInput[]
    OR?: TurfWhereInput[]
    NOT?: TurfWhereInput | TurfWhereInput[]
    name?: StringFilter<"Turf"> | string
    location?: StringNullableFilter<"Turf"> | string | null
    parentTurfId?: StringNullableFilter<"Turf"> | string | null
    createdAt?: DateTimeFilter<"Turf"> | Date | string
    updatedAt?: DateTimeFilter<"Turf"> | Date | string
    parentTurf?: XOR<TurfNullableScalarRelationFilter, TurfWhereInput> | null
    childTurfs?: TurfListRelationFilter
    sports?: TurfSportListRelationFilter
  }, "id">

  export type TurfOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrderInput | SortOrder
    parentTurfId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TurfCountOrderByAggregateInput
    _max?: TurfMaxOrderByAggregateInput
    _min?: TurfMinOrderByAggregateInput
  }

  export type TurfScalarWhereWithAggregatesInput = {
    AND?: TurfScalarWhereWithAggregatesInput | TurfScalarWhereWithAggregatesInput[]
    OR?: TurfScalarWhereWithAggregatesInput[]
    NOT?: TurfScalarWhereWithAggregatesInput | TurfScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Turf"> | string
    name?: StringWithAggregatesFilter<"Turf"> | string
    location?: StringNullableWithAggregatesFilter<"Turf"> | string | null
    parentTurfId?: StringNullableWithAggregatesFilter<"Turf"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Turf"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Turf"> | Date | string
  }

  export type TurfSportWhereInput = {
    AND?: TurfSportWhereInput | TurfSportWhereInput[]
    OR?: TurfSportWhereInput[]
    NOT?: TurfSportWhereInput | TurfSportWhereInput[]
    turfId?: StringFilter<"TurfSport"> | string
    sportId?: StringFilter<"TurfSport"> | string
    turf?: XOR<TurfScalarRelationFilter, TurfWhereInput>
    sport?: XOR<SportScalarRelationFilter, SportWhereInput>
  }

  export type TurfSportOrderByWithRelationInput = {
    turfId?: SortOrder
    sportId?: SortOrder
    turf?: TurfOrderByWithRelationInput
    sport?: SportOrderByWithRelationInput
  }

  export type TurfSportWhereUniqueInput = Prisma.AtLeast<{
    turfId_sportId?: TurfSportTurfIdSportIdCompoundUniqueInput
    AND?: TurfSportWhereInput | TurfSportWhereInput[]
    OR?: TurfSportWhereInput[]
    NOT?: TurfSportWhereInput | TurfSportWhereInput[]
    turfId?: StringFilter<"TurfSport"> | string
    sportId?: StringFilter<"TurfSport"> | string
    turf?: XOR<TurfScalarRelationFilter, TurfWhereInput>
    sport?: XOR<SportScalarRelationFilter, SportWhereInput>
  }, "turfId_sportId">

  export type TurfSportOrderByWithAggregationInput = {
    turfId?: SortOrder
    sportId?: SortOrder
    _count?: TurfSportCountOrderByAggregateInput
    _max?: TurfSportMaxOrderByAggregateInput
    _min?: TurfSportMinOrderByAggregateInput
  }

  export type TurfSportScalarWhereWithAggregatesInput = {
    AND?: TurfSportScalarWhereWithAggregatesInput | TurfSportScalarWhereWithAggregatesInput[]
    OR?: TurfSportScalarWhereWithAggregatesInput[]
    NOT?: TurfSportScalarWhereWithAggregatesInput | TurfSportScalarWhereWithAggregatesInput[]
    turfId?: StringWithAggregatesFilter<"TurfSport"> | string
    sportId?: StringWithAggregatesFilter<"TurfSport"> | string
  }

  export type MembershipPlanWhereInput = {
    AND?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    OR?: MembershipPlanWhereInput[]
    NOT?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    id?: StringFilter<"MembershipPlan"> | string
    name?: StringFilter<"MembershipPlan"> | string
    sportId?: StringFilter<"MembershipPlan"> | string
    durationInDays?: IntFilter<"MembershipPlan"> | number
    price?: FloatFilter<"MembershipPlan"> | number
    slotsPerDay?: IntFilter<"MembershipPlan"> | number
    createdAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    sport?: XOR<SportScalarRelationFilter, SportWhereInput>
    memberships?: MemberMembershipListRelationFilter
    attendances?: AttendanceListRelationFilter
  }

  export type MembershipPlanOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    sportId?: SortOrder
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sport?: SportOrderByWithRelationInput
    memberships?: MemberMembershipOrderByRelationAggregateInput
    attendances?: AttendanceOrderByRelationAggregateInput
  }

  export type MembershipPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    OR?: MembershipPlanWhereInput[]
    NOT?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    name?: StringFilter<"MembershipPlan"> | string
    sportId?: StringFilter<"MembershipPlan"> | string
    durationInDays?: IntFilter<"MembershipPlan"> | number
    price?: FloatFilter<"MembershipPlan"> | number
    slotsPerDay?: IntFilter<"MembershipPlan"> | number
    createdAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    sport?: XOR<SportScalarRelationFilter, SportWhereInput>
    memberships?: MemberMembershipListRelationFilter
    attendances?: AttendanceListRelationFilter
  }, "id">

  export type MembershipPlanOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    sportId?: SortOrder
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MembershipPlanCountOrderByAggregateInput
    _avg?: MembershipPlanAvgOrderByAggregateInput
    _max?: MembershipPlanMaxOrderByAggregateInput
    _min?: MembershipPlanMinOrderByAggregateInput
    _sum?: MembershipPlanSumOrderByAggregateInput
  }

  export type MembershipPlanScalarWhereWithAggregatesInput = {
    AND?: MembershipPlanScalarWhereWithAggregatesInput | MembershipPlanScalarWhereWithAggregatesInput[]
    OR?: MembershipPlanScalarWhereWithAggregatesInput[]
    NOT?: MembershipPlanScalarWhereWithAggregatesInput | MembershipPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MembershipPlan"> | string
    name?: StringWithAggregatesFilter<"MembershipPlan"> | string
    sportId?: StringWithAggregatesFilter<"MembershipPlan"> | string
    durationInDays?: IntWithAggregatesFilter<"MembershipPlan"> | number
    price?: FloatWithAggregatesFilter<"MembershipPlan"> | number
    slotsPerDay?: IntWithAggregatesFilter<"MembershipPlan"> | number
    createdAt?: DateTimeWithAggregatesFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MembershipPlan"> | Date | string
  }

  export type MemberMembershipWhereInput = {
    AND?: MemberMembershipWhereInput | MemberMembershipWhereInput[]
    OR?: MemberMembershipWhereInput[]
    NOT?: MemberMembershipWhereInput | MemberMembershipWhereInput[]
    id?: StringFilter<"MemberMembership"> | string
    memberId?: StringFilter<"MemberMembership"> | string
    membershipPlanId?: StringFilter<"MemberMembership"> | string
    startDate?: DateTimeFilter<"MemberMembership"> | Date | string
    endDate?: DateTimeFilter<"MemberMembership"> | Date | string
    status?: StringFilter<"MemberMembership"> | string
    createdAt?: DateTimeFilter<"MemberMembership"> | Date | string
    updatedAt?: DateTimeFilter<"MemberMembership"> | Date | string
    member?: XOR<MemberScalarRelationFilter, MemberWhereInput>
    membershipPlan?: XOR<MembershipPlanScalarRelationFilter, MembershipPlanWhereInput>
  }

  export type MemberMembershipOrderByWithRelationInput = {
    id?: SortOrder
    memberId?: SortOrder
    membershipPlanId?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    member?: MemberOrderByWithRelationInput
    membershipPlan?: MembershipPlanOrderByWithRelationInput
  }

  export type MemberMembershipWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemberMembershipWhereInput | MemberMembershipWhereInput[]
    OR?: MemberMembershipWhereInput[]
    NOT?: MemberMembershipWhereInput | MemberMembershipWhereInput[]
    memberId?: StringFilter<"MemberMembership"> | string
    membershipPlanId?: StringFilter<"MemberMembership"> | string
    startDate?: DateTimeFilter<"MemberMembership"> | Date | string
    endDate?: DateTimeFilter<"MemberMembership"> | Date | string
    status?: StringFilter<"MemberMembership"> | string
    createdAt?: DateTimeFilter<"MemberMembership"> | Date | string
    updatedAt?: DateTimeFilter<"MemberMembership"> | Date | string
    member?: XOR<MemberScalarRelationFilter, MemberWhereInput>
    membershipPlan?: XOR<MembershipPlanScalarRelationFilter, MembershipPlanWhereInput>
  }, "id">

  export type MemberMembershipOrderByWithAggregationInput = {
    id?: SortOrder
    memberId?: SortOrder
    membershipPlanId?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MemberMembershipCountOrderByAggregateInput
    _max?: MemberMembershipMaxOrderByAggregateInput
    _min?: MemberMembershipMinOrderByAggregateInput
  }

  export type MemberMembershipScalarWhereWithAggregatesInput = {
    AND?: MemberMembershipScalarWhereWithAggregatesInput | MemberMembershipScalarWhereWithAggregatesInput[]
    OR?: MemberMembershipScalarWhereWithAggregatesInput[]
    NOT?: MemberMembershipScalarWhereWithAggregatesInput | MemberMembershipScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemberMembership"> | string
    memberId?: StringWithAggregatesFilter<"MemberMembership"> | string
    membershipPlanId?: StringWithAggregatesFilter<"MemberMembership"> | string
    startDate?: DateTimeWithAggregatesFilter<"MemberMembership"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"MemberMembership"> | Date | string
    status?: StringWithAggregatesFilter<"MemberMembership"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MemberMembership"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MemberMembership"> | Date | string
  }

  export type AttendanceWhereInput = {
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    id?: StringFilter<"Attendance"> | string
    memberId?: StringFilter<"Attendance"> | string
    date?: DateTimeFilter<"Attendance"> | Date | string
    status?: StringFilter<"Attendance"> | string
    sportId?: StringNullableFilter<"Attendance"> | string | null
    membershipPlanId?: StringNullableFilter<"Attendance"> | string | null
    notes?: StringNullableFilter<"Attendance"> | string | null
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    member?: XOR<MemberScalarRelationFilter, MemberWhereInput>
    sport?: XOR<SportNullableScalarRelationFilter, SportWhereInput> | null
    membershipPlan?: XOR<MembershipPlanNullableScalarRelationFilter, MembershipPlanWhereInput> | null
  }

  export type AttendanceOrderByWithRelationInput = {
    id?: SortOrder
    memberId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    sportId?: SortOrderInput | SortOrder
    membershipPlanId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    member?: MemberOrderByWithRelationInput
    sport?: SportOrderByWithRelationInput
    membershipPlan?: MembershipPlanOrderByWithRelationInput
  }

  export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    memberId?: StringFilter<"Attendance"> | string
    date?: DateTimeFilter<"Attendance"> | Date | string
    status?: StringFilter<"Attendance"> | string
    sportId?: StringNullableFilter<"Attendance"> | string | null
    membershipPlanId?: StringNullableFilter<"Attendance"> | string | null
    notes?: StringNullableFilter<"Attendance"> | string | null
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    member?: XOR<MemberScalarRelationFilter, MemberWhereInput>
    sport?: XOR<SportNullableScalarRelationFilter, SportWhereInput> | null
    membershipPlan?: XOR<MembershipPlanNullableScalarRelationFilter, MembershipPlanWhereInput> | null
  }, "id">

  export type AttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    memberId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    sportId?: SortOrderInput | SortOrder
    membershipPlanId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AttendanceCountOrderByAggregateInput
    _max?: AttendanceMaxOrderByAggregateInput
    _min?: AttendanceMinOrderByAggregateInput
  }

  export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    OR?: AttendanceScalarWhereWithAggregatesInput[]
    NOT?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attendance"> | string
    memberId?: StringWithAggregatesFilter<"Attendance"> | string
    date?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
    status?: StringWithAggregatesFilter<"Attendance"> | string
    sportId?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
    membershipPlanId?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
  }

  export type AdminCreateInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminCreateManyInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberCreateInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipCreateNestedManyWithoutMemberInput
    attendances?: AttendanceCreateNestedManyWithoutMemberInput
  }

  export type MemberUncheckedCreateInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipUncheckedCreateNestedManyWithoutMemberInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutMemberInput
  }

  export type MemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUpdateManyWithoutMemberNestedInput
    attendances?: AttendanceUpdateManyWithoutMemberNestedInput
  }

  export type MemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUncheckedUpdateManyWithoutMemberNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type MemberCreateManyInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SportCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportCreateNestedManyWithoutSportInput
    membershipPlans?: MembershipPlanCreateNestedManyWithoutSportInput
    attendances?: AttendanceCreateNestedManyWithoutSportInput
  }

  export type SportUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportUncheckedCreateNestedManyWithoutSportInput
    membershipPlans?: MembershipPlanUncheckedCreateNestedManyWithoutSportInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutSportInput
  }

  export type SportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUpdateManyWithoutSportNestedInput
    membershipPlans?: MembershipPlanUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUpdateManyWithoutSportNestedInput
  }

  export type SportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUncheckedUpdateManyWithoutSportNestedInput
    membershipPlans?: MembershipPlanUncheckedUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutSportNestedInput
  }

  export type SportCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfCreateInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    parentTurf?: TurfCreateNestedOneWithoutChildTurfsInput
    childTurfs?: TurfCreateNestedManyWithoutParentTurfInput
    sports?: TurfSportCreateNestedManyWithoutTurfInput
  }

  export type TurfUncheckedCreateInput = {
    id?: string
    name: string
    location?: string | null
    parentTurfId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childTurfs?: TurfUncheckedCreateNestedManyWithoutParentTurfInput
    sports?: TurfSportUncheckedCreateNestedManyWithoutTurfInput
  }

  export type TurfUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parentTurf?: TurfUpdateOneWithoutChildTurfsNestedInput
    childTurfs?: TurfUpdateManyWithoutParentTurfNestedInput
    sports?: TurfSportUpdateManyWithoutTurfNestedInput
  }

  export type TurfUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    parentTurfId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childTurfs?: TurfUncheckedUpdateManyWithoutParentTurfNestedInput
    sports?: TurfSportUncheckedUpdateManyWithoutTurfNestedInput
  }

  export type TurfCreateManyInput = {
    id?: string
    name: string
    location?: string | null
    parentTurfId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TurfUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    parentTurfId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfSportCreateInput = {
    turf: TurfCreateNestedOneWithoutSportsInput
    sport: SportCreateNestedOneWithoutTurfsInput
  }

  export type TurfSportUncheckedCreateInput = {
    turfId: string
    sportId: string
  }

  export type TurfSportUpdateInput = {
    turf?: TurfUpdateOneRequiredWithoutSportsNestedInput
    sport?: SportUpdateOneRequiredWithoutTurfsNestedInput
  }

  export type TurfSportUncheckedUpdateInput = {
    turfId?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
  }

  export type TurfSportCreateManyInput = {
    turfId: string
    sportId: string
  }

  export type TurfSportUpdateManyMutationInput = {

  }

  export type TurfSportUncheckedUpdateManyInput = {
    turfId?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
  }

  export type MembershipPlanCreateInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    sport: SportCreateNestedOneWithoutMembershipPlansInput
    memberships?: MemberMembershipCreateNestedManyWithoutMembershipPlanInput
    attendances?: AttendanceCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanUncheckedCreateInput = {
    id?: string
    name: string
    sportId: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipUncheckedCreateNestedManyWithoutMembershipPlanInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sport?: SportUpdateOneRequiredWithoutMembershipPlansNestedInput
    memberships?: MemberMembershipUpdateManyWithoutMembershipPlanNestedInput
    attendances?: AttendanceUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUncheckedUpdateManyWithoutMembershipPlanNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanCreateManyInput = {
    id?: string
    name: string
    sportId: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MembershipPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberMembershipCreateInput = {
    id?: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    member: MemberCreateNestedOneWithoutMembershipsInput
    membershipPlan: MembershipPlanCreateNestedOneWithoutMembershipsInput
  }

  export type MemberMembershipUncheckedCreateInput = {
    id?: string
    memberId: string
    membershipPlanId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberMembershipUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: MemberUpdateOneRequiredWithoutMembershipsNestedInput
    membershipPlan?: MembershipPlanUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MemberMembershipUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberMembershipCreateManyInput = {
    id?: string
    memberId: string
    membershipPlanId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberMembershipUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberMembershipUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateInput = {
    id?: string
    date?: Date | string
    status?: string
    notes?: string | null
    createdAt?: Date | string
    member: MemberCreateNestedOneWithoutAttendancesInput
    sport?: SportCreateNestedOneWithoutAttendancesInput
    membershipPlan?: MembershipPlanCreateNestedOneWithoutAttendancesInput
  }

  export type AttendanceUncheckedCreateInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    sportId?: string | null
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type AttendanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: MemberUpdateOneRequiredWithoutAttendancesNestedInput
    sport?: SportUpdateOneWithoutAttendancesNestedInput
    membershipPlan?: MembershipPlanUpdateOneWithoutAttendancesNestedInput
  }

  export type AttendanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateManyInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    sportId?: string | null
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type AttendanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AdminCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type MemberMembershipListRelationFilter = {
    every?: MemberMembershipWhereInput
    some?: MemberMembershipWhereInput
    none?: MemberMembershipWhereInput
  }

  export type AttendanceListRelationFilter = {
    every?: AttendanceWhereInput
    some?: AttendanceWhereInput
    none?: AttendanceWhereInput
  }

  export type MemberMembershipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttendanceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemberCountOrderByAggregateInput = {
    id?: SortOrder
    mobile?: SortOrder
    name?: SortOrder
    email?: SortOrder
    joinDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MemberMaxOrderByAggregateInput = {
    id?: SortOrder
    mobile?: SortOrder
    name?: SortOrder
    email?: SortOrder
    joinDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MemberMinOrderByAggregateInput = {
    id?: SortOrder
    mobile?: SortOrder
    name?: SortOrder
    email?: SortOrder
    joinDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TurfSportListRelationFilter = {
    every?: TurfSportWhereInput
    some?: TurfSportWhereInput
    none?: TurfSportWhereInput
  }

  export type MembershipPlanListRelationFilter = {
    every?: MembershipPlanWhereInput
    some?: MembershipPlanWhereInput
    none?: MembershipPlanWhereInput
  }

  export type TurfSportOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MembershipPlanOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SportCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SportMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SportMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TurfNullableScalarRelationFilter = {
    is?: TurfWhereInput | null
    isNot?: TurfWhereInput | null
  }

  export type TurfListRelationFilter = {
    every?: TurfWhereInput
    some?: TurfWhereInput
    none?: TurfWhereInput
  }

  export type TurfOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TurfCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    parentTurfId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TurfMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    parentTurfId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TurfMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    parentTurfId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TurfScalarRelationFilter = {
    is?: TurfWhereInput
    isNot?: TurfWhereInput
  }

  export type SportScalarRelationFilter = {
    is?: SportWhereInput
    isNot?: SportWhereInput
  }

  export type TurfSportTurfIdSportIdCompoundUniqueInput = {
    turfId: string
    sportId: string
  }

  export type TurfSportCountOrderByAggregateInput = {
    turfId?: SortOrder
    sportId?: SortOrder
  }

  export type TurfSportMaxOrderByAggregateInput = {
    turfId?: SortOrder
    sportId?: SortOrder
  }

  export type TurfSportMinOrderByAggregateInput = {
    turfId?: SortOrder
    sportId?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type MembershipPlanCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sportId?: SortOrder
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipPlanAvgOrderByAggregateInput = {
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
  }

  export type MembershipPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sportId?: SortOrder
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipPlanMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sportId?: SortOrder
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipPlanSumOrderByAggregateInput = {
    durationInDays?: SortOrder
    price?: SortOrder
    slotsPerDay?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type MemberScalarRelationFilter = {
    is?: MemberWhereInput
    isNot?: MemberWhereInput
  }

  export type MembershipPlanScalarRelationFilter = {
    is?: MembershipPlanWhereInput
    isNot?: MembershipPlanWhereInput
  }

  export type MemberMembershipCountOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    membershipPlanId?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MemberMembershipMaxOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    membershipPlanId?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MemberMembershipMinOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    membershipPlanId?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SportNullableScalarRelationFilter = {
    is?: SportWhereInput | null
    isNot?: SportWhereInput | null
  }

  export type MembershipPlanNullableScalarRelationFilter = {
    is?: MembershipPlanWhereInput | null
    isNot?: MembershipPlanWhereInput | null
  }

  export type AttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    sportId?: SortOrder
    membershipPlanId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    sportId?: SortOrder
    membershipPlanId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    memberId?: SortOrder
    date?: SortOrder
    status?: SortOrder
    sportId?: SortOrder
    membershipPlanId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MemberMembershipCreateNestedManyWithoutMemberInput = {
    create?: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput> | MemberMembershipCreateWithoutMemberInput[] | MemberMembershipUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMemberInput | MemberMembershipCreateOrConnectWithoutMemberInput[]
    createMany?: MemberMembershipCreateManyMemberInputEnvelope
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
  }

  export type AttendanceCreateNestedManyWithoutMemberInput = {
    create?: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput> | AttendanceCreateWithoutMemberInput[] | AttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMemberInput | AttendanceCreateOrConnectWithoutMemberInput[]
    createMany?: AttendanceCreateManyMemberInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type MemberMembershipUncheckedCreateNestedManyWithoutMemberInput = {
    create?: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput> | MemberMembershipCreateWithoutMemberInput[] | MemberMembershipUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMemberInput | MemberMembershipCreateOrConnectWithoutMemberInput[]
    createMany?: MemberMembershipCreateManyMemberInputEnvelope
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
  }

  export type AttendanceUncheckedCreateNestedManyWithoutMemberInput = {
    create?: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput> | AttendanceCreateWithoutMemberInput[] | AttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMemberInput | AttendanceCreateOrConnectWithoutMemberInput[]
    createMany?: AttendanceCreateManyMemberInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type MemberMembershipUpdateManyWithoutMemberNestedInput = {
    create?: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput> | MemberMembershipCreateWithoutMemberInput[] | MemberMembershipUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMemberInput | MemberMembershipCreateOrConnectWithoutMemberInput[]
    upsert?: MemberMembershipUpsertWithWhereUniqueWithoutMemberInput | MemberMembershipUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: MemberMembershipCreateManyMemberInputEnvelope
    set?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    disconnect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    delete?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    update?: MemberMembershipUpdateWithWhereUniqueWithoutMemberInput | MemberMembershipUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: MemberMembershipUpdateManyWithWhereWithoutMemberInput | MemberMembershipUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
  }

  export type AttendanceUpdateManyWithoutMemberNestedInput = {
    create?: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput> | AttendanceCreateWithoutMemberInput[] | AttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMemberInput | AttendanceCreateOrConnectWithoutMemberInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutMemberInput | AttendanceUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: AttendanceCreateManyMemberInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutMemberInput | AttendanceUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutMemberInput | AttendanceUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type MemberMembershipUncheckedUpdateManyWithoutMemberNestedInput = {
    create?: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput> | MemberMembershipCreateWithoutMemberInput[] | MemberMembershipUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMemberInput | MemberMembershipCreateOrConnectWithoutMemberInput[]
    upsert?: MemberMembershipUpsertWithWhereUniqueWithoutMemberInput | MemberMembershipUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: MemberMembershipCreateManyMemberInputEnvelope
    set?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    disconnect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    delete?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    update?: MemberMembershipUpdateWithWhereUniqueWithoutMemberInput | MemberMembershipUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: MemberMembershipUpdateManyWithWhereWithoutMemberInput | MemberMembershipUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
  }

  export type AttendanceUncheckedUpdateManyWithoutMemberNestedInput = {
    create?: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput> | AttendanceCreateWithoutMemberInput[] | AttendanceUncheckedCreateWithoutMemberInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMemberInput | AttendanceCreateOrConnectWithoutMemberInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutMemberInput | AttendanceUpsertWithWhereUniqueWithoutMemberInput[]
    createMany?: AttendanceCreateManyMemberInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutMemberInput | AttendanceUpdateWithWhereUniqueWithoutMemberInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutMemberInput | AttendanceUpdateManyWithWhereWithoutMemberInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type TurfSportCreateNestedManyWithoutSportInput = {
    create?: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput> | TurfSportCreateWithoutSportInput[] | TurfSportUncheckedCreateWithoutSportInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutSportInput | TurfSportCreateOrConnectWithoutSportInput[]
    createMany?: TurfSportCreateManySportInputEnvelope
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
  }

  export type MembershipPlanCreateNestedManyWithoutSportInput = {
    create?: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput> | MembershipPlanCreateWithoutSportInput[] | MembershipPlanUncheckedCreateWithoutSportInput[]
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutSportInput | MembershipPlanCreateOrConnectWithoutSportInput[]
    createMany?: MembershipPlanCreateManySportInputEnvelope
    connect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
  }

  export type AttendanceCreateNestedManyWithoutSportInput = {
    create?: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput> | AttendanceCreateWithoutSportInput[] | AttendanceUncheckedCreateWithoutSportInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutSportInput | AttendanceCreateOrConnectWithoutSportInput[]
    createMany?: AttendanceCreateManySportInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type TurfSportUncheckedCreateNestedManyWithoutSportInput = {
    create?: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput> | TurfSportCreateWithoutSportInput[] | TurfSportUncheckedCreateWithoutSportInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutSportInput | TurfSportCreateOrConnectWithoutSportInput[]
    createMany?: TurfSportCreateManySportInputEnvelope
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
  }

  export type MembershipPlanUncheckedCreateNestedManyWithoutSportInput = {
    create?: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput> | MembershipPlanCreateWithoutSportInput[] | MembershipPlanUncheckedCreateWithoutSportInput[]
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutSportInput | MembershipPlanCreateOrConnectWithoutSportInput[]
    createMany?: MembershipPlanCreateManySportInputEnvelope
    connect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
  }

  export type AttendanceUncheckedCreateNestedManyWithoutSportInput = {
    create?: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput> | AttendanceCreateWithoutSportInput[] | AttendanceUncheckedCreateWithoutSportInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutSportInput | AttendanceCreateOrConnectWithoutSportInput[]
    createMany?: AttendanceCreateManySportInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type TurfSportUpdateManyWithoutSportNestedInput = {
    create?: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput> | TurfSportCreateWithoutSportInput[] | TurfSportUncheckedCreateWithoutSportInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutSportInput | TurfSportCreateOrConnectWithoutSportInput[]
    upsert?: TurfSportUpsertWithWhereUniqueWithoutSportInput | TurfSportUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: TurfSportCreateManySportInputEnvelope
    set?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    disconnect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    delete?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    update?: TurfSportUpdateWithWhereUniqueWithoutSportInput | TurfSportUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: TurfSportUpdateManyWithWhereWithoutSportInput | TurfSportUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
  }

  export type MembershipPlanUpdateManyWithoutSportNestedInput = {
    create?: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput> | MembershipPlanCreateWithoutSportInput[] | MembershipPlanUncheckedCreateWithoutSportInput[]
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutSportInput | MembershipPlanCreateOrConnectWithoutSportInput[]
    upsert?: MembershipPlanUpsertWithWhereUniqueWithoutSportInput | MembershipPlanUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: MembershipPlanCreateManySportInputEnvelope
    set?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    disconnect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    delete?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    connect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    update?: MembershipPlanUpdateWithWhereUniqueWithoutSportInput | MembershipPlanUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: MembershipPlanUpdateManyWithWhereWithoutSportInput | MembershipPlanUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: MembershipPlanScalarWhereInput | MembershipPlanScalarWhereInput[]
  }

  export type AttendanceUpdateManyWithoutSportNestedInput = {
    create?: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput> | AttendanceCreateWithoutSportInput[] | AttendanceUncheckedCreateWithoutSportInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutSportInput | AttendanceCreateOrConnectWithoutSportInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutSportInput | AttendanceUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: AttendanceCreateManySportInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutSportInput | AttendanceUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutSportInput | AttendanceUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type TurfSportUncheckedUpdateManyWithoutSportNestedInput = {
    create?: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput> | TurfSportCreateWithoutSportInput[] | TurfSportUncheckedCreateWithoutSportInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutSportInput | TurfSportCreateOrConnectWithoutSportInput[]
    upsert?: TurfSportUpsertWithWhereUniqueWithoutSportInput | TurfSportUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: TurfSportCreateManySportInputEnvelope
    set?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    disconnect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    delete?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    update?: TurfSportUpdateWithWhereUniqueWithoutSportInput | TurfSportUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: TurfSportUpdateManyWithWhereWithoutSportInput | TurfSportUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
  }

  export type MembershipPlanUncheckedUpdateManyWithoutSportNestedInput = {
    create?: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput> | MembershipPlanCreateWithoutSportInput[] | MembershipPlanUncheckedCreateWithoutSportInput[]
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutSportInput | MembershipPlanCreateOrConnectWithoutSportInput[]
    upsert?: MembershipPlanUpsertWithWhereUniqueWithoutSportInput | MembershipPlanUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: MembershipPlanCreateManySportInputEnvelope
    set?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    disconnect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    delete?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    connect?: MembershipPlanWhereUniqueInput | MembershipPlanWhereUniqueInput[]
    update?: MembershipPlanUpdateWithWhereUniqueWithoutSportInput | MembershipPlanUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: MembershipPlanUpdateManyWithWhereWithoutSportInput | MembershipPlanUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: MembershipPlanScalarWhereInput | MembershipPlanScalarWhereInput[]
  }

  export type AttendanceUncheckedUpdateManyWithoutSportNestedInput = {
    create?: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput> | AttendanceCreateWithoutSportInput[] | AttendanceUncheckedCreateWithoutSportInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutSportInput | AttendanceCreateOrConnectWithoutSportInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutSportInput | AttendanceUpsertWithWhereUniqueWithoutSportInput[]
    createMany?: AttendanceCreateManySportInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutSportInput | AttendanceUpdateWithWhereUniqueWithoutSportInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutSportInput | AttendanceUpdateManyWithWhereWithoutSportInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type TurfCreateNestedOneWithoutChildTurfsInput = {
    create?: XOR<TurfCreateWithoutChildTurfsInput, TurfUncheckedCreateWithoutChildTurfsInput>
    connectOrCreate?: TurfCreateOrConnectWithoutChildTurfsInput
    connect?: TurfWhereUniqueInput
  }

  export type TurfCreateNestedManyWithoutParentTurfInput = {
    create?: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput> | TurfCreateWithoutParentTurfInput[] | TurfUncheckedCreateWithoutParentTurfInput[]
    connectOrCreate?: TurfCreateOrConnectWithoutParentTurfInput | TurfCreateOrConnectWithoutParentTurfInput[]
    createMany?: TurfCreateManyParentTurfInputEnvelope
    connect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
  }

  export type TurfSportCreateNestedManyWithoutTurfInput = {
    create?: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput> | TurfSportCreateWithoutTurfInput[] | TurfSportUncheckedCreateWithoutTurfInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutTurfInput | TurfSportCreateOrConnectWithoutTurfInput[]
    createMany?: TurfSportCreateManyTurfInputEnvelope
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
  }

  export type TurfUncheckedCreateNestedManyWithoutParentTurfInput = {
    create?: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput> | TurfCreateWithoutParentTurfInput[] | TurfUncheckedCreateWithoutParentTurfInput[]
    connectOrCreate?: TurfCreateOrConnectWithoutParentTurfInput | TurfCreateOrConnectWithoutParentTurfInput[]
    createMany?: TurfCreateManyParentTurfInputEnvelope
    connect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
  }

  export type TurfSportUncheckedCreateNestedManyWithoutTurfInput = {
    create?: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput> | TurfSportCreateWithoutTurfInput[] | TurfSportUncheckedCreateWithoutTurfInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutTurfInput | TurfSportCreateOrConnectWithoutTurfInput[]
    createMany?: TurfSportCreateManyTurfInputEnvelope
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
  }

  export type TurfUpdateOneWithoutChildTurfsNestedInput = {
    create?: XOR<TurfCreateWithoutChildTurfsInput, TurfUncheckedCreateWithoutChildTurfsInput>
    connectOrCreate?: TurfCreateOrConnectWithoutChildTurfsInput
    upsert?: TurfUpsertWithoutChildTurfsInput
    disconnect?: TurfWhereInput | boolean
    delete?: TurfWhereInput | boolean
    connect?: TurfWhereUniqueInput
    update?: XOR<XOR<TurfUpdateToOneWithWhereWithoutChildTurfsInput, TurfUpdateWithoutChildTurfsInput>, TurfUncheckedUpdateWithoutChildTurfsInput>
  }

  export type TurfUpdateManyWithoutParentTurfNestedInput = {
    create?: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput> | TurfCreateWithoutParentTurfInput[] | TurfUncheckedCreateWithoutParentTurfInput[]
    connectOrCreate?: TurfCreateOrConnectWithoutParentTurfInput | TurfCreateOrConnectWithoutParentTurfInput[]
    upsert?: TurfUpsertWithWhereUniqueWithoutParentTurfInput | TurfUpsertWithWhereUniqueWithoutParentTurfInput[]
    createMany?: TurfCreateManyParentTurfInputEnvelope
    set?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    disconnect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    delete?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    connect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    update?: TurfUpdateWithWhereUniqueWithoutParentTurfInput | TurfUpdateWithWhereUniqueWithoutParentTurfInput[]
    updateMany?: TurfUpdateManyWithWhereWithoutParentTurfInput | TurfUpdateManyWithWhereWithoutParentTurfInput[]
    deleteMany?: TurfScalarWhereInput | TurfScalarWhereInput[]
  }

  export type TurfSportUpdateManyWithoutTurfNestedInput = {
    create?: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput> | TurfSportCreateWithoutTurfInput[] | TurfSportUncheckedCreateWithoutTurfInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutTurfInput | TurfSportCreateOrConnectWithoutTurfInput[]
    upsert?: TurfSportUpsertWithWhereUniqueWithoutTurfInput | TurfSportUpsertWithWhereUniqueWithoutTurfInput[]
    createMany?: TurfSportCreateManyTurfInputEnvelope
    set?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    disconnect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    delete?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    update?: TurfSportUpdateWithWhereUniqueWithoutTurfInput | TurfSportUpdateWithWhereUniqueWithoutTurfInput[]
    updateMany?: TurfSportUpdateManyWithWhereWithoutTurfInput | TurfSportUpdateManyWithWhereWithoutTurfInput[]
    deleteMany?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
  }

  export type TurfUncheckedUpdateManyWithoutParentTurfNestedInput = {
    create?: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput> | TurfCreateWithoutParentTurfInput[] | TurfUncheckedCreateWithoutParentTurfInput[]
    connectOrCreate?: TurfCreateOrConnectWithoutParentTurfInput | TurfCreateOrConnectWithoutParentTurfInput[]
    upsert?: TurfUpsertWithWhereUniqueWithoutParentTurfInput | TurfUpsertWithWhereUniqueWithoutParentTurfInput[]
    createMany?: TurfCreateManyParentTurfInputEnvelope
    set?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    disconnect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    delete?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    connect?: TurfWhereUniqueInput | TurfWhereUniqueInput[]
    update?: TurfUpdateWithWhereUniqueWithoutParentTurfInput | TurfUpdateWithWhereUniqueWithoutParentTurfInput[]
    updateMany?: TurfUpdateManyWithWhereWithoutParentTurfInput | TurfUpdateManyWithWhereWithoutParentTurfInput[]
    deleteMany?: TurfScalarWhereInput | TurfScalarWhereInput[]
  }

  export type TurfSportUncheckedUpdateManyWithoutTurfNestedInput = {
    create?: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput> | TurfSportCreateWithoutTurfInput[] | TurfSportUncheckedCreateWithoutTurfInput[]
    connectOrCreate?: TurfSportCreateOrConnectWithoutTurfInput | TurfSportCreateOrConnectWithoutTurfInput[]
    upsert?: TurfSportUpsertWithWhereUniqueWithoutTurfInput | TurfSportUpsertWithWhereUniqueWithoutTurfInput[]
    createMany?: TurfSportCreateManyTurfInputEnvelope
    set?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    disconnect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    delete?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    connect?: TurfSportWhereUniqueInput | TurfSportWhereUniqueInput[]
    update?: TurfSportUpdateWithWhereUniqueWithoutTurfInput | TurfSportUpdateWithWhereUniqueWithoutTurfInput[]
    updateMany?: TurfSportUpdateManyWithWhereWithoutTurfInput | TurfSportUpdateManyWithWhereWithoutTurfInput[]
    deleteMany?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
  }

  export type TurfCreateNestedOneWithoutSportsInput = {
    create?: XOR<TurfCreateWithoutSportsInput, TurfUncheckedCreateWithoutSportsInput>
    connectOrCreate?: TurfCreateOrConnectWithoutSportsInput
    connect?: TurfWhereUniqueInput
  }

  export type SportCreateNestedOneWithoutTurfsInput = {
    create?: XOR<SportCreateWithoutTurfsInput, SportUncheckedCreateWithoutTurfsInput>
    connectOrCreate?: SportCreateOrConnectWithoutTurfsInput
    connect?: SportWhereUniqueInput
  }

  export type TurfUpdateOneRequiredWithoutSportsNestedInput = {
    create?: XOR<TurfCreateWithoutSportsInput, TurfUncheckedCreateWithoutSportsInput>
    connectOrCreate?: TurfCreateOrConnectWithoutSportsInput
    upsert?: TurfUpsertWithoutSportsInput
    connect?: TurfWhereUniqueInput
    update?: XOR<XOR<TurfUpdateToOneWithWhereWithoutSportsInput, TurfUpdateWithoutSportsInput>, TurfUncheckedUpdateWithoutSportsInput>
  }

  export type SportUpdateOneRequiredWithoutTurfsNestedInput = {
    create?: XOR<SportCreateWithoutTurfsInput, SportUncheckedCreateWithoutTurfsInput>
    connectOrCreate?: SportCreateOrConnectWithoutTurfsInput
    upsert?: SportUpsertWithoutTurfsInput
    connect?: SportWhereUniqueInput
    update?: XOR<XOR<SportUpdateToOneWithWhereWithoutTurfsInput, SportUpdateWithoutTurfsInput>, SportUncheckedUpdateWithoutTurfsInput>
  }

  export type SportCreateNestedOneWithoutMembershipPlansInput = {
    create?: XOR<SportCreateWithoutMembershipPlansInput, SportUncheckedCreateWithoutMembershipPlansInput>
    connectOrCreate?: SportCreateOrConnectWithoutMembershipPlansInput
    connect?: SportWhereUniqueInput
  }

  export type MemberMembershipCreateNestedManyWithoutMembershipPlanInput = {
    create?: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput> | MemberMembershipCreateWithoutMembershipPlanInput[] | MemberMembershipUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMembershipPlanInput | MemberMembershipCreateOrConnectWithoutMembershipPlanInput[]
    createMany?: MemberMembershipCreateManyMembershipPlanInputEnvelope
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
  }

  export type AttendanceCreateNestedManyWithoutMembershipPlanInput = {
    create?: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput> | AttendanceCreateWithoutMembershipPlanInput[] | AttendanceUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMembershipPlanInput | AttendanceCreateOrConnectWithoutMembershipPlanInput[]
    createMany?: AttendanceCreateManyMembershipPlanInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type MemberMembershipUncheckedCreateNestedManyWithoutMembershipPlanInput = {
    create?: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput> | MemberMembershipCreateWithoutMembershipPlanInput[] | MemberMembershipUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMembershipPlanInput | MemberMembershipCreateOrConnectWithoutMembershipPlanInput[]
    createMany?: MemberMembershipCreateManyMembershipPlanInputEnvelope
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
  }

  export type AttendanceUncheckedCreateNestedManyWithoutMembershipPlanInput = {
    create?: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput> | AttendanceCreateWithoutMembershipPlanInput[] | AttendanceUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMembershipPlanInput | AttendanceCreateOrConnectWithoutMembershipPlanInput[]
    createMany?: AttendanceCreateManyMembershipPlanInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SportUpdateOneRequiredWithoutMembershipPlansNestedInput = {
    create?: XOR<SportCreateWithoutMembershipPlansInput, SportUncheckedCreateWithoutMembershipPlansInput>
    connectOrCreate?: SportCreateOrConnectWithoutMembershipPlansInput
    upsert?: SportUpsertWithoutMembershipPlansInput
    connect?: SportWhereUniqueInput
    update?: XOR<XOR<SportUpdateToOneWithWhereWithoutMembershipPlansInput, SportUpdateWithoutMembershipPlansInput>, SportUncheckedUpdateWithoutMembershipPlansInput>
  }

  export type MemberMembershipUpdateManyWithoutMembershipPlanNestedInput = {
    create?: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput> | MemberMembershipCreateWithoutMembershipPlanInput[] | MemberMembershipUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMembershipPlanInput | MemberMembershipCreateOrConnectWithoutMembershipPlanInput[]
    upsert?: MemberMembershipUpsertWithWhereUniqueWithoutMembershipPlanInput | MemberMembershipUpsertWithWhereUniqueWithoutMembershipPlanInput[]
    createMany?: MemberMembershipCreateManyMembershipPlanInputEnvelope
    set?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    disconnect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    delete?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    update?: MemberMembershipUpdateWithWhereUniqueWithoutMembershipPlanInput | MemberMembershipUpdateWithWhereUniqueWithoutMembershipPlanInput[]
    updateMany?: MemberMembershipUpdateManyWithWhereWithoutMembershipPlanInput | MemberMembershipUpdateManyWithWhereWithoutMembershipPlanInput[]
    deleteMany?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
  }

  export type AttendanceUpdateManyWithoutMembershipPlanNestedInput = {
    create?: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput> | AttendanceCreateWithoutMembershipPlanInput[] | AttendanceUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMembershipPlanInput | AttendanceCreateOrConnectWithoutMembershipPlanInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutMembershipPlanInput | AttendanceUpsertWithWhereUniqueWithoutMembershipPlanInput[]
    createMany?: AttendanceCreateManyMembershipPlanInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutMembershipPlanInput | AttendanceUpdateWithWhereUniqueWithoutMembershipPlanInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutMembershipPlanInput | AttendanceUpdateManyWithWhereWithoutMembershipPlanInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type MemberMembershipUncheckedUpdateManyWithoutMembershipPlanNestedInput = {
    create?: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput> | MemberMembershipCreateWithoutMembershipPlanInput[] | MemberMembershipUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: MemberMembershipCreateOrConnectWithoutMembershipPlanInput | MemberMembershipCreateOrConnectWithoutMembershipPlanInput[]
    upsert?: MemberMembershipUpsertWithWhereUniqueWithoutMembershipPlanInput | MemberMembershipUpsertWithWhereUniqueWithoutMembershipPlanInput[]
    createMany?: MemberMembershipCreateManyMembershipPlanInputEnvelope
    set?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    disconnect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    delete?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    connect?: MemberMembershipWhereUniqueInput | MemberMembershipWhereUniqueInput[]
    update?: MemberMembershipUpdateWithWhereUniqueWithoutMembershipPlanInput | MemberMembershipUpdateWithWhereUniqueWithoutMembershipPlanInput[]
    updateMany?: MemberMembershipUpdateManyWithWhereWithoutMembershipPlanInput | MemberMembershipUpdateManyWithWhereWithoutMembershipPlanInput[]
    deleteMany?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
  }

  export type AttendanceUncheckedUpdateManyWithoutMembershipPlanNestedInput = {
    create?: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput> | AttendanceCreateWithoutMembershipPlanInput[] | AttendanceUncheckedCreateWithoutMembershipPlanInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutMembershipPlanInput | AttendanceCreateOrConnectWithoutMembershipPlanInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutMembershipPlanInput | AttendanceUpsertWithWhereUniqueWithoutMembershipPlanInput[]
    createMany?: AttendanceCreateManyMembershipPlanInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutMembershipPlanInput | AttendanceUpdateWithWhereUniqueWithoutMembershipPlanInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutMembershipPlanInput | AttendanceUpdateManyWithWhereWithoutMembershipPlanInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type MemberCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<MemberCreateWithoutMembershipsInput, MemberUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: MemberCreateOrConnectWithoutMembershipsInput
    connect?: MemberWhereUniqueInput
  }

  export type MembershipPlanCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<MembershipPlanCreateWithoutMembershipsInput, MembershipPlanUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutMembershipsInput
    connect?: MembershipPlanWhereUniqueInput
  }

  export type MemberUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<MemberCreateWithoutMembershipsInput, MemberUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: MemberCreateOrConnectWithoutMembershipsInput
    upsert?: MemberUpsertWithoutMembershipsInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutMembershipsInput, MemberUpdateWithoutMembershipsInput>, MemberUncheckedUpdateWithoutMembershipsInput>
  }

  export type MembershipPlanUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<MembershipPlanCreateWithoutMembershipsInput, MembershipPlanUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutMembershipsInput
    upsert?: MembershipPlanUpsertWithoutMembershipsInput
    connect?: MembershipPlanWhereUniqueInput
    update?: XOR<XOR<MembershipPlanUpdateToOneWithWhereWithoutMembershipsInput, MembershipPlanUpdateWithoutMembershipsInput>, MembershipPlanUncheckedUpdateWithoutMembershipsInput>
  }

  export type MemberCreateNestedOneWithoutAttendancesInput = {
    create?: XOR<MemberCreateWithoutAttendancesInput, MemberUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: MemberCreateOrConnectWithoutAttendancesInput
    connect?: MemberWhereUniqueInput
  }

  export type SportCreateNestedOneWithoutAttendancesInput = {
    create?: XOR<SportCreateWithoutAttendancesInput, SportUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: SportCreateOrConnectWithoutAttendancesInput
    connect?: SportWhereUniqueInput
  }

  export type MembershipPlanCreateNestedOneWithoutAttendancesInput = {
    create?: XOR<MembershipPlanCreateWithoutAttendancesInput, MembershipPlanUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutAttendancesInput
    connect?: MembershipPlanWhereUniqueInput
  }

  export type MemberUpdateOneRequiredWithoutAttendancesNestedInput = {
    create?: XOR<MemberCreateWithoutAttendancesInput, MemberUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: MemberCreateOrConnectWithoutAttendancesInput
    upsert?: MemberUpsertWithoutAttendancesInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutAttendancesInput, MemberUpdateWithoutAttendancesInput>, MemberUncheckedUpdateWithoutAttendancesInput>
  }

  export type SportUpdateOneWithoutAttendancesNestedInput = {
    create?: XOR<SportCreateWithoutAttendancesInput, SportUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: SportCreateOrConnectWithoutAttendancesInput
    upsert?: SportUpsertWithoutAttendancesInput
    disconnect?: SportWhereInput | boolean
    delete?: SportWhereInput | boolean
    connect?: SportWhereUniqueInput
    update?: XOR<XOR<SportUpdateToOneWithWhereWithoutAttendancesInput, SportUpdateWithoutAttendancesInput>, SportUncheckedUpdateWithoutAttendancesInput>
  }

  export type MembershipPlanUpdateOneWithoutAttendancesNestedInput = {
    create?: XOR<MembershipPlanCreateWithoutAttendancesInput, MembershipPlanUncheckedCreateWithoutAttendancesInput>
    connectOrCreate?: MembershipPlanCreateOrConnectWithoutAttendancesInput
    upsert?: MembershipPlanUpsertWithoutAttendancesInput
    disconnect?: MembershipPlanWhereInput | boolean
    delete?: MembershipPlanWhereInput | boolean
    connect?: MembershipPlanWhereUniqueInput
    update?: XOR<XOR<MembershipPlanUpdateToOneWithWhereWithoutAttendancesInput, MembershipPlanUpdateWithoutAttendancesInput>, MembershipPlanUncheckedUpdateWithoutAttendancesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type MemberMembershipCreateWithoutMemberInput = {
    id?: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membershipPlan: MembershipPlanCreateNestedOneWithoutMembershipsInput
  }

  export type MemberMembershipUncheckedCreateWithoutMemberInput = {
    id?: string
    membershipPlanId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberMembershipCreateOrConnectWithoutMemberInput = {
    where: MemberMembershipWhereUniqueInput
    create: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput>
  }

  export type MemberMembershipCreateManyMemberInputEnvelope = {
    data: MemberMembershipCreateManyMemberInput | MemberMembershipCreateManyMemberInput[]
  }

  export type AttendanceCreateWithoutMemberInput = {
    id?: string
    date?: Date | string
    status?: string
    notes?: string | null
    createdAt?: Date | string
    sport?: SportCreateNestedOneWithoutAttendancesInput
    membershipPlan?: MembershipPlanCreateNestedOneWithoutAttendancesInput
  }

  export type AttendanceUncheckedCreateWithoutMemberInput = {
    id?: string
    date?: Date | string
    status?: string
    sportId?: string | null
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type AttendanceCreateOrConnectWithoutMemberInput = {
    where: AttendanceWhereUniqueInput
    create: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput>
  }

  export type AttendanceCreateManyMemberInputEnvelope = {
    data: AttendanceCreateManyMemberInput | AttendanceCreateManyMemberInput[]
  }

  export type MemberMembershipUpsertWithWhereUniqueWithoutMemberInput = {
    where: MemberMembershipWhereUniqueInput
    update: XOR<MemberMembershipUpdateWithoutMemberInput, MemberMembershipUncheckedUpdateWithoutMemberInput>
    create: XOR<MemberMembershipCreateWithoutMemberInput, MemberMembershipUncheckedCreateWithoutMemberInput>
  }

  export type MemberMembershipUpdateWithWhereUniqueWithoutMemberInput = {
    where: MemberMembershipWhereUniqueInput
    data: XOR<MemberMembershipUpdateWithoutMemberInput, MemberMembershipUncheckedUpdateWithoutMemberInput>
  }

  export type MemberMembershipUpdateManyWithWhereWithoutMemberInput = {
    where: MemberMembershipScalarWhereInput
    data: XOR<MemberMembershipUpdateManyMutationInput, MemberMembershipUncheckedUpdateManyWithoutMemberInput>
  }

  export type MemberMembershipScalarWhereInput = {
    AND?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
    OR?: MemberMembershipScalarWhereInput[]
    NOT?: MemberMembershipScalarWhereInput | MemberMembershipScalarWhereInput[]
    id?: StringFilter<"MemberMembership"> | string
    memberId?: StringFilter<"MemberMembership"> | string
    membershipPlanId?: StringFilter<"MemberMembership"> | string
    startDate?: DateTimeFilter<"MemberMembership"> | Date | string
    endDate?: DateTimeFilter<"MemberMembership"> | Date | string
    status?: StringFilter<"MemberMembership"> | string
    createdAt?: DateTimeFilter<"MemberMembership"> | Date | string
    updatedAt?: DateTimeFilter<"MemberMembership"> | Date | string
  }

  export type AttendanceUpsertWithWhereUniqueWithoutMemberInput = {
    where: AttendanceWhereUniqueInput
    update: XOR<AttendanceUpdateWithoutMemberInput, AttendanceUncheckedUpdateWithoutMemberInput>
    create: XOR<AttendanceCreateWithoutMemberInput, AttendanceUncheckedCreateWithoutMemberInput>
  }

  export type AttendanceUpdateWithWhereUniqueWithoutMemberInput = {
    where: AttendanceWhereUniqueInput
    data: XOR<AttendanceUpdateWithoutMemberInput, AttendanceUncheckedUpdateWithoutMemberInput>
  }

  export type AttendanceUpdateManyWithWhereWithoutMemberInput = {
    where: AttendanceScalarWhereInput
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyWithoutMemberInput>
  }

  export type AttendanceScalarWhereInput = {
    AND?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    OR?: AttendanceScalarWhereInput[]
    NOT?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    id?: StringFilter<"Attendance"> | string
    memberId?: StringFilter<"Attendance"> | string
    date?: DateTimeFilter<"Attendance"> | Date | string
    status?: StringFilter<"Attendance"> | string
    sportId?: StringNullableFilter<"Attendance"> | string | null
    membershipPlanId?: StringNullableFilter<"Attendance"> | string | null
    notes?: StringNullableFilter<"Attendance"> | string | null
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
  }

  export type TurfSportCreateWithoutSportInput = {
    turf: TurfCreateNestedOneWithoutSportsInput
  }

  export type TurfSportUncheckedCreateWithoutSportInput = {
    turfId: string
  }

  export type TurfSportCreateOrConnectWithoutSportInput = {
    where: TurfSportWhereUniqueInput
    create: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput>
  }

  export type TurfSportCreateManySportInputEnvelope = {
    data: TurfSportCreateManySportInput | TurfSportCreateManySportInput[]
  }

  export type MembershipPlanCreateWithoutSportInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipCreateNestedManyWithoutMembershipPlanInput
    attendances?: AttendanceCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanUncheckedCreateWithoutSportInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipUncheckedCreateNestedManyWithoutMembershipPlanInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanCreateOrConnectWithoutSportInput = {
    where: MembershipPlanWhereUniqueInput
    create: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput>
  }

  export type MembershipPlanCreateManySportInputEnvelope = {
    data: MembershipPlanCreateManySportInput | MembershipPlanCreateManySportInput[]
  }

  export type AttendanceCreateWithoutSportInput = {
    id?: string
    date?: Date | string
    status?: string
    notes?: string | null
    createdAt?: Date | string
    member: MemberCreateNestedOneWithoutAttendancesInput
    membershipPlan?: MembershipPlanCreateNestedOneWithoutAttendancesInput
  }

  export type AttendanceUncheckedCreateWithoutSportInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type AttendanceCreateOrConnectWithoutSportInput = {
    where: AttendanceWhereUniqueInput
    create: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput>
  }

  export type AttendanceCreateManySportInputEnvelope = {
    data: AttendanceCreateManySportInput | AttendanceCreateManySportInput[]
  }

  export type TurfSportUpsertWithWhereUniqueWithoutSportInput = {
    where: TurfSportWhereUniqueInput
    update: XOR<TurfSportUpdateWithoutSportInput, TurfSportUncheckedUpdateWithoutSportInput>
    create: XOR<TurfSportCreateWithoutSportInput, TurfSportUncheckedCreateWithoutSportInput>
  }

  export type TurfSportUpdateWithWhereUniqueWithoutSportInput = {
    where: TurfSportWhereUniqueInput
    data: XOR<TurfSportUpdateWithoutSportInput, TurfSportUncheckedUpdateWithoutSportInput>
  }

  export type TurfSportUpdateManyWithWhereWithoutSportInput = {
    where: TurfSportScalarWhereInput
    data: XOR<TurfSportUpdateManyMutationInput, TurfSportUncheckedUpdateManyWithoutSportInput>
  }

  export type TurfSportScalarWhereInput = {
    AND?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
    OR?: TurfSportScalarWhereInput[]
    NOT?: TurfSportScalarWhereInput | TurfSportScalarWhereInput[]
    turfId?: StringFilter<"TurfSport"> | string
    sportId?: StringFilter<"TurfSport"> | string
  }

  export type MembershipPlanUpsertWithWhereUniqueWithoutSportInput = {
    where: MembershipPlanWhereUniqueInput
    update: XOR<MembershipPlanUpdateWithoutSportInput, MembershipPlanUncheckedUpdateWithoutSportInput>
    create: XOR<MembershipPlanCreateWithoutSportInput, MembershipPlanUncheckedCreateWithoutSportInput>
  }

  export type MembershipPlanUpdateWithWhereUniqueWithoutSportInput = {
    where: MembershipPlanWhereUniqueInput
    data: XOR<MembershipPlanUpdateWithoutSportInput, MembershipPlanUncheckedUpdateWithoutSportInput>
  }

  export type MembershipPlanUpdateManyWithWhereWithoutSportInput = {
    where: MembershipPlanScalarWhereInput
    data: XOR<MembershipPlanUpdateManyMutationInput, MembershipPlanUncheckedUpdateManyWithoutSportInput>
  }

  export type MembershipPlanScalarWhereInput = {
    AND?: MembershipPlanScalarWhereInput | MembershipPlanScalarWhereInput[]
    OR?: MembershipPlanScalarWhereInput[]
    NOT?: MembershipPlanScalarWhereInput | MembershipPlanScalarWhereInput[]
    id?: StringFilter<"MembershipPlan"> | string
    name?: StringFilter<"MembershipPlan"> | string
    sportId?: StringFilter<"MembershipPlan"> | string
    durationInDays?: IntFilter<"MembershipPlan"> | number
    price?: FloatFilter<"MembershipPlan"> | number
    slotsPerDay?: IntFilter<"MembershipPlan"> | number
    createdAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MembershipPlan"> | Date | string
  }

  export type AttendanceUpsertWithWhereUniqueWithoutSportInput = {
    where: AttendanceWhereUniqueInput
    update: XOR<AttendanceUpdateWithoutSportInput, AttendanceUncheckedUpdateWithoutSportInput>
    create: XOR<AttendanceCreateWithoutSportInput, AttendanceUncheckedCreateWithoutSportInput>
  }

  export type AttendanceUpdateWithWhereUniqueWithoutSportInput = {
    where: AttendanceWhereUniqueInput
    data: XOR<AttendanceUpdateWithoutSportInput, AttendanceUncheckedUpdateWithoutSportInput>
  }

  export type AttendanceUpdateManyWithWhereWithoutSportInput = {
    where: AttendanceScalarWhereInput
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyWithoutSportInput>
  }

  export type TurfCreateWithoutChildTurfsInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    parentTurf?: TurfCreateNestedOneWithoutChildTurfsInput
    sports?: TurfSportCreateNestedManyWithoutTurfInput
  }

  export type TurfUncheckedCreateWithoutChildTurfsInput = {
    id?: string
    name: string
    location?: string | null
    parentTurfId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sports?: TurfSportUncheckedCreateNestedManyWithoutTurfInput
  }

  export type TurfCreateOrConnectWithoutChildTurfsInput = {
    where: TurfWhereUniqueInput
    create: XOR<TurfCreateWithoutChildTurfsInput, TurfUncheckedCreateWithoutChildTurfsInput>
  }

  export type TurfCreateWithoutParentTurfInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childTurfs?: TurfCreateNestedManyWithoutParentTurfInput
    sports?: TurfSportCreateNestedManyWithoutTurfInput
  }

  export type TurfUncheckedCreateWithoutParentTurfInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childTurfs?: TurfUncheckedCreateNestedManyWithoutParentTurfInput
    sports?: TurfSportUncheckedCreateNestedManyWithoutTurfInput
  }

  export type TurfCreateOrConnectWithoutParentTurfInput = {
    where: TurfWhereUniqueInput
    create: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput>
  }

  export type TurfCreateManyParentTurfInputEnvelope = {
    data: TurfCreateManyParentTurfInput | TurfCreateManyParentTurfInput[]
  }

  export type TurfSportCreateWithoutTurfInput = {
    sport: SportCreateNestedOneWithoutTurfsInput
  }

  export type TurfSportUncheckedCreateWithoutTurfInput = {
    sportId: string
  }

  export type TurfSportCreateOrConnectWithoutTurfInput = {
    where: TurfSportWhereUniqueInput
    create: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput>
  }

  export type TurfSportCreateManyTurfInputEnvelope = {
    data: TurfSportCreateManyTurfInput | TurfSportCreateManyTurfInput[]
  }

  export type TurfUpsertWithoutChildTurfsInput = {
    update: XOR<TurfUpdateWithoutChildTurfsInput, TurfUncheckedUpdateWithoutChildTurfsInput>
    create: XOR<TurfCreateWithoutChildTurfsInput, TurfUncheckedCreateWithoutChildTurfsInput>
    where?: TurfWhereInput
  }

  export type TurfUpdateToOneWithWhereWithoutChildTurfsInput = {
    where?: TurfWhereInput
    data: XOR<TurfUpdateWithoutChildTurfsInput, TurfUncheckedUpdateWithoutChildTurfsInput>
  }

  export type TurfUpdateWithoutChildTurfsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parentTurf?: TurfUpdateOneWithoutChildTurfsNestedInput
    sports?: TurfSportUpdateManyWithoutTurfNestedInput
  }

  export type TurfUncheckedUpdateWithoutChildTurfsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    parentTurfId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sports?: TurfSportUncheckedUpdateManyWithoutTurfNestedInput
  }

  export type TurfUpsertWithWhereUniqueWithoutParentTurfInput = {
    where: TurfWhereUniqueInput
    update: XOR<TurfUpdateWithoutParentTurfInput, TurfUncheckedUpdateWithoutParentTurfInput>
    create: XOR<TurfCreateWithoutParentTurfInput, TurfUncheckedCreateWithoutParentTurfInput>
  }

  export type TurfUpdateWithWhereUniqueWithoutParentTurfInput = {
    where: TurfWhereUniqueInput
    data: XOR<TurfUpdateWithoutParentTurfInput, TurfUncheckedUpdateWithoutParentTurfInput>
  }

  export type TurfUpdateManyWithWhereWithoutParentTurfInput = {
    where: TurfScalarWhereInput
    data: XOR<TurfUpdateManyMutationInput, TurfUncheckedUpdateManyWithoutParentTurfInput>
  }

  export type TurfScalarWhereInput = {
    AND?: TurfScalarWhereInput | TurfScalarWhereInput[]
    OR?: TurfScalarWhereInput[]
    NOT?: TurfScalarWhereInput | TurfScalarWhereInput[]
    id?: StringFilter<"Turf"> | string
    name?: StringFilter<"Turf"> | string
    location?: StringNullableFilter<"Turf"> | string | null
    parentTurfId?: StringNullableFilter<"Turf"> | string | null
    createdAt?: DateTimeFilter<"Turf"> | Date | string
    updatedAt?: DateTimeFilter<"Turf"> | Date | string
  }

  export type TurfSportUpsertWithWhereUniqueWithoutTurfInput = {
    where: TurfSportWhereUniqueInput
    update: XOR<TurfSportUpdateWithoutTurfInput, TurfSportUncheckedUpdateWithoutTurfInput>
    create: XOR<TurfSportCreateWithoutTurfInput, TurfSportUncheckedCreateWithoutTurfInput>
  }

  export type TurfSportUpdateWithWhereUniqueWithoutTurfInput = {
    where: TurfSportWhereUniqueInput
    data: XOR<TurfSportUpdateWithoutTurfInput, TurfSportUncheckedUpdateWithoutTurfInput>
  }

  export type TurfSportUpdateManyWithWhereWithoutTurfInput = {
    where: TurfSportScalarWhereInput
    data: XOR<TurfSportUpdateManyMutationInput, TurfSportUncheckedUpdateManyWithoutTurfInput>
  }

  export type TurfCreateWithoutSportsInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    parentTurf?: TurfCreateNestedOneWithoutChildTurfsInput
    childTurfs?: TurfCreateNestedManyWithoutParentTurfInput
  }

  export type TurfUncheckedCreateWithoutSportsInput = {
    id?: string
    name: string
    location?: string | null
    parentTurfId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childTurfs?: TurfUncheckedCreateNestedManyWithoutParentTurfInput
  }

  export type TurfCreateOrConnectWithoutSportsInput = {
    where: TurfWhereUniqueInput
    create: XOR<TurfCreateWithoutSportsInput, TurfUncheckedCreateWithoutSportsInput>
  }

  export type SportCreateWithoutTurfsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    membershipPlans?: MembershipPlanCreateNestedManyWithoutSportInput
    attendances?: AttendanceCreateNestedManyWithoutSportInput
  }

  export type SportUncheckedCreateWithoutTurfsInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    membershipPlans?: MembershipPlanUncheckedCreateNestedManyWithoutSportInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutSportInput
  }

  export type SportCreateOrConnectWithoutTurfsInput = {
    where: SportWhereUniqueInput
    create: XOR<SportCreateWithoutTurfsInput, SportUncheckedCreateWithoutTurfsInput>
  }

  export type TurfUpsertWithoutSportsInput = {
    update: XOR<TurfUpdateWithoutSportsInput, TurfUncheckedUpdateWithoutSportsInput>
    create: XOR<TurfCreateWithoutSportsInput, TurfUncheckedCreateWithoutSportsInput>
    where?: TurfWhereInput
  }

  export type TurfUpdateToOneWithWhereWithoutSportsInput = {
    where?: TurfWhereInput
    data: XOR<TurfUpdateWithoutSportsInput, TurfUncheckedUpdateWithoutSportsInput>
  }

  export type TurfUpdateWithoutSportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parentTurf?: TurfUpdateOneWithoutChildTurfsNestedInput
    childTurfs?: TurfUpdateManyWithoutParentTurfNestedInput
  }

  export type TurfUncheckedUpdateWithoutSportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    parentTurfId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childTurfs?: TurfUncheckedUpdateManyWithoutParentTurfNestedInput
  }

  export type SportUpsertWithoutTurfsInput = {
    update: XOR<SportUpdateWithoutTurfsInput, SportUncheckedUpdateWithoutTurfsInput>
    create: XOR<SportCreateWithoutTurfsInput, SportUncheckedCreateWithoutTurfsInput>
    where?: SportWhereInput
  }

  export type SportUpdateToOneWithWhereWithoutTurfsInput = {
    where?: SportWhereInput
    data: XOR<SportUpdateWithoutTurfsInput, SportUncheckedUpdateWithoutTurfsInput>
  }

  export type SportUpdateWithoutTurfsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membershipPlans?: MembershipPlanUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUpdateManyWithoutSportNestedInput
  }

  export type SportUncheckedUpdateWithoutTurfsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membershipPlans?: MembershipPlanUncheckedUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutSportNestedInput
  }

  export type SportCreateWithoutMembershipPlansInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportCreateNestedManyWithoutSportInput
    attendances?: AttendanceCreateNestedManyWithoutSportInput
  }

  export type SportUncheckedCreateWithoutMembershipPlansInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportUncheckedCreateNestedManyWithoutSportInput
    attendances?: AttendanceUncheckedCreateNestedManyWithoutSportInput
  }

  export type SportCreateOrConnectWithoutMembershipPlansInput = {
    where: SportWhereUniqueInput
    create: XOR<SportCreateWithoutMembershipPlansInput, SportUncheckedCreateWithoutMembershipPlansInput>
  }

  export type MemberMembershipCreateWithoutMembershipPlanInput = {
    id?: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    member: MemberCreateNestedOneWithoutMembershipsInput
  }

  export type MemberMembershipUncheckedCreateWithoutMembershipPlanInput = {
    id?: string
    memberId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberMembershipCreateOrConnectWithoutMembershipPlanInput = {
    where: MemberMembershipWhereUniqueInput
    create: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput>
  }

  export type MemberMembershipCreateManyMembershipPlanInputEnvelope = {
    data: MemberMembershipCreateManyMembershipPlanInput | MemberMembershipCreateManyMembershipPlanInput[]
  }

  export type AttendanceCreateWithoutMembershipPlanInput = {
    id?: string
    date?: Date | string
    status?: string
    notes?: string | null
    createdAt?: Date | string
    member: MemberCreateNestedOneWithoutAttendancesInput
    sport?: SportCreateNestedOneWithoutAttendancesInput
  }

  export type AttendanceUncheckedCreateWithoutMembershipPlanInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    sportId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type AttendanceCreateOrConnectWithoutMembershipPlanInput = {
    where: AttendanceWhereUniqueInput
    create: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput>
  }

  export type AttendanceCreateManyMembershipPlanInputEnvelope = {
    data: AttendanceCreateManyMembershipPlanInput | AttendanceCreateManyMembershipPlanInput[]
  }

  export type SportUpsertWithoutMembershipPlansInput = {
    update: XOR<SportUpdateWithoutMembershipPlansInput, SportUncheckedUpdateWithoutMembershipPlansInput>
    create: XOR<SportCreateWithoutMembershipPlansInput, SportUncheckedCreateWithoutMembershipPlansInput>
    where?: SportWhereInput
  }

  export type SportUpdateToOneWithWhereWithoutMembershipPlansInput = {
    where?: SportWhereInput
    data: XOR<SportUpdateWithoutMembershipPlansInput, SportUncheckedUpdateWithoutMembershipPlansInput>
  }

  export type SportUpdateWithoutMembershipPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUpdateManyWithoutSportNestedInput
  }

  export type SportUncheckedUpdateWithoutMembershipPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUncheckedUpdateManyWithoutSportNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutSportNestedInput
  }

  export type MemberMembershipUpsertWithWhereUniqueWithoutMembershipPlanInput = {
    where: MemberMembershipWhereUniqueInput
    update: XOR<MemberMembershipUpdateWithoutMembershipPlanInput, MemberMembershipUncheckedUpdateWithoutMembershipPlanInput>
    create: XOR<MemberMembershipCreateWithoutMembershipPlanInput, MemberMembershipUncheckedCreateWithoutMembershipPlanInput>
  }

  export type MemberMembershipUpdateWithWhereUniqueWithoutMembershipPlanInput = {
    where: MemberMembershipWhereUniqueInput
    data: XOR<MemberMembershipUpdateWithoutMembershipPlanInput, MemberMembershipUncheckedUpdateWithoutMembershipPlanInput>
  }

  export type MemberMembershipUpdateManyWithWhereWithoutMembershipPlanInput = {
    where: MemberMembershipScalarWhereInput
    data: XOR<MemberMembershipUpdateManyMutationInput, MemberMembershipUncheckedUpdateManyWithoutMembershipPlanInput>
  }

  export type AttendanceUpsertWithWhereUniqueWithoutMembershipPlanInput = {
    where: AttendanceWhereUniqueInput
    update: XOR<AttendanceUpdateWithoutMembershipPlanInput, AttendanceUncheckedUpdateWithoutMembershipPlanInput>
    create: XOR<AttendanceCreateWithoutMembershipPlanInput, AttendanceUncheckedCreateWithoutMembershipPlanInput>
  }

  export type AttendanceUpdateWithWhereUniqueWithoutMembershipPlanInput = {
    where: AttendanceWhereUniqueInput
    data: XOR<AttendanceUpdateWithoutMembershipPlanInput, AttendanceUncheckedUpdateWithoutMembershipPlanInput>
  }

  export type AttendanceUpdateManyWithWhereWithoutMembershipPlanInput = {
    where: AttendanceScalarWhereInput
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyWithoutMembershipPlanInput>
  }

  export type MemberCreateWithoutMembershipsInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendances?: AttendanceCreateNestedManyWithoutMemberInput
  }

  export type MemberUncheckedCreateWithoutMembershipsInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    attendances?: AttendanceUncheckedCreateNestedManyWithoutMemberInput
  }

  export type MemberCreateOrConnectWithoutMembershipsInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutMembershipsInput, MemberUncheckedCreateWithoutMembershipsInput>
  }

  export type MembershipPlanCreateWithoutMembershipsInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    sport: SportCreateNestedOneWithoutMembershipPlansInput
    attendances?: AttendanceCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanUncheckedCreateWithoutMembershipsInput = {
    id?: string
    name: string
    sportId: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    attendances?: AttendanceUncheckedCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanCreateOrConnectWithoutMembershipsInput = {
    where: MembershipPlanWhereUniqueInput
    create: XOR<MembershipPlanCreateWithoutMembershipsInput, MembershipPlanUncheckedCreateWithoutMembershipsInput>
  }

  export type MemberUpsertWithoutMembershipsInput = {
    update: XOR<MemberUpdateWithoutMembershipsInput, MemberUncheckedUpdateWithoutMembershipsInput>
    create: XOR<MemberCreateWithoutMembershipsInput, MemberUncheckedCreateWithoutMembershipsInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutMembershipsInput, MemberUncheckedUpdateWithoutMembershipsInput>
  }

  export type MemberUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendances?: AttendanceUpdateManyWithoutMemberNestedInput
  }

  export type MemberUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendances?: AttendanceUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type MembershipPlanUpsertWithoutMembershipsInput = {
    update: XOR<MembershipPlanUpdateWithoutMembershipsInput, MembershipPlanUncheckedUpdateWithoutMembershipsInput>
    create: XOR<MembershipPlanCreateWithoutMembershipsInput, MembershipPlanUncheckedCreateWithoutMembershipsInput>
    where?: MembershipPlanWhereInput
  }

  export type MembershipPlanUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: MembershipPlanWhereInput
    data: XOR<MembershipPlanUpdateWithoutMembershipsInput, MembershipPlanUncheckedUpdateWithoutMembershipsInput>
  }

  export type MembershipPlanUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sport?: SportUpdateOneRequiredWithoutMembershipPlansNestedInput
    attendances?: AttendanceUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attendances?: AttendanceUncheckedUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MemberCreateWithoutAttendancesInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipCreateNestedManyWithoutMemberInput
  }

  export type MemberUncheckedCreateWithoutAttendancesInput = {
    id?: string
    mobile: string
    name: string
    email?: string | null
    joinDate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipUncheckedCreateNestedManyWithoutMemberInput
  }

  export type MemberCreateOrConnectWithoutAttendancesInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutAttendancesInput, MemberUncheckedCreateWithoutAttendancesInput>
  }

  export type SportCreateWithoutAttendancesInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportCreateNestedManyWithoutSportInput
    membershipPlans?: MembershipPlanCreateNestedManyWithoutSportInput
  }

  export type SportUncheckedCreateWithoutAttendancesInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    turfs?: TurfSportUncheckedCreateNestedManyWithoutSportInput
    membershipPlans?: MembershipPlanUncheckedCreateNestedManyWithoutSportInput
  }

  export type SportCreateOrConnectWithoutAttendancesInput = {
    where: SportWhereUniqueInput
    create: XOR<SportCreateWithoutAttendancesInput, SportUncheckedCreateWithoutAttendancesInput>
  }

  export type MembershipPlanCreateWithoutAttendancesInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    sport: SportCreateNestedOneWithoutMembershipPlansInput
    memberships?: MemberMembershipCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanUncheckedCreateWithoutAttendancesInput = {
    id?: string
    name: string
    sportId: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MemberMembershipUncheckedCreateNestedManyWithoutMembershipPlanInput
  }

  export type MembershipPlanCreateOrConnectWithoutAttendancesInput = {
    where: MembershipPlanWhereUniqueInput
    create: XOR<MembershipPlanCreateWithoutAttendancesInput, MembershipPlanUncheckedCreateWithoutAttendancesInput>
  }

  export type MemberUpsertWithoutAttendancesInput = {
    update: XOR<MemberUpdateWithoutAttendancesInput, MemberUncheckedUpdateWithoutAttendancesInput>
    create: XOR<MemberCreateWithoutAttendancesInput, MemberUncheckedCreateWithoutAttendancesInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutAttendancesInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutAttendancesInput, MemberUncheckedUpdateWithoutAttendancesInput>
  }

  export type MemberUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUpdateManyWithoutMemberNestedInput
  }

  export type MemberUncheckedUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    joinDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUncheckedUpdateManyWithoutMemberNestedInput
  }

  export type SportUpsertWithoutAttendancesInput = {
    update: XOR<SportUpdateWithoutAttendancesInput, SportUncheckedUpdateWithoutAttendancesInput>
    create: XOR<SportCreateWithoutAttendancesInput, SportUncheckedCreateWithoutAttendancesInput>
    where?: SportWhereInput
  }

  export type SportUpdateToOneWithWhereWithoutAttendancesInput = {
    where?: SportWhereInput
    data: XOR<SportUpdateWithoutAttendancesInput, SportUncheckedUpdateWithoutAttendancesInput>
  }

  export type SportUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUpdateManyWithoutSportNestedInput
    membershipPlans?: MembershipPlanUpdateManyWithoutSportNestedInput
  }

  export type SportUncheckedUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    turfs?: TurfSportUncheckedUpdateManyWithoutSportNestedInput
    membershipPlans?: MembershipPlanUncheckedUpdateManyWithoutSportNestedInput
  }

  export type MembershipPlanUpsertWithoutAttendancesInput = {
    update: XOR<MembershipPlanUpdateWithoutAttendancesInput, MembershipPlanUncheckedUpdateWithoutAttendancesInput>
    create: XOR<MembershipPlanCreateWithoutAttendancesInput, MembershipPlanUncheckedCreateWithoutAttendancesInput>
    where?: MembershipPlanWhereInput
  }

  export type MembershipPlanUpdateToOneWithWhereWithoutAttendancesInput = {
    where?: MembershipPlanWhereInput
    data: XOR<MembershipPlanUpdateWithoutAttendancesInput, MembershipPlanUncheckedUpdateWithoutAttendancesInput>
  }

  export type MembershipPlanUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sport?: SportUpdateOneRequiredWithoutMembershipPlansNestedInput
    memberships?: MemberMembershipUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanUncheckedUpdateWithoutAttendancesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sportId?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUncheckedUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MemberMembershipCreateManyMemberInput = {
    id?: string
    membershipPlanId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttendanceCreateManyMemberInput = {
    id?: string
    date?: Date | string
    status?: string
    sportId?: string | null
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type MemberMembershipUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membershipPlan?: MembershipPlanUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MemberMembershipUncheckedUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberMembershipUncheckedUpdateManyWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sport?: SportUpdateOneWithoutAttendancesNestedInput
    membershipPlan?: MembershipPlanUpdateOneWithoutAttendancesNestedInput
  }

  export type AttendanceUncheckedUpdateWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyWithoutMemberInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfSportCreateManySportInput = {
    turfId: string
  }

  export type MembershipPlanCreateManySportInput = {
    id?: string
    name: string
    durationInDays: number
    price: number
    slotsPerDay?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttendanceCreateManySportInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    membershipPlanId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type TurfSportUpdateWithoutSportInput = {
    turf?: TurfUpdateOneRequiredWithoutSportsNestedInput
  }

  export type TurfSportUncheckedUpdateWithoutSportInput = {
    turfId?: StringFieldUpdateOperationsInput | string
  }

  export type TurfSportUncheckedUpdateManyWithoutSportInput = {
    turfId?: StringFieldUpdateOperationsInput | string
  }

  export type MembershipPlanUpdateWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUpdateManyWithoutMembershipPlanNestedInput
    attendances?: AttendanceUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanUncheckedUpdateWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MemberMembershipUncheckedUpdateManyWithoutMembershipPlanNestedInput
    attendances?: AttendanceUncheckedUpdateManyWithoutMembershipPlanNestedInput
  }

  export type MembershipPlanUncheckedUpdateManyWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    durationInDays?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    slotsPerDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUpdateWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: MemberUpdateOneRequiredWithoutAttendancesNestedInput
    membershipPlan?: MembershipPlanUpdateOneWithoutAttendancesNestedInput
  }

  export type AttendanceUncheckedUpdateWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyWithoutSportInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    membershipPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfCreateManyParentTurfInput = {
    id?: string
    name: string
    location?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TurfSportCreateManyTurfInput = {
    sportId: string
  }

  export type TurfUpdateWithoutParentTurfInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childTurfs?: TurfUpdateManyWithoutParentTurfNestedInput
    sports?: TurfSportUpdateManyWithoutTurfNestedInput
  }

  export type TurfUncheckedUpdateWithoutParentTurfInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childTurfs?: TurfUncheckedUpdateManyWithoutParentTurfNestedInput
    sports?: TurfSportUncheckedUpdateManyWithoutTurfNestedInput
  }

  export type TurfUncheckedUpdateManyWithoutParentTurfInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TurfSportUpdateWithoutTurfInput = {
    sport?: SportUpdateOneRequiredWithoutTurfsNestedInput
  }

  export type TurfSportUncheckedUpdateWithoutTurfInput = {
    sportId?: StringFieldUpdateOperationsInput | string
  }

  export type TurfSportUncheckedUpdateManyWithoutTurfInput = {
    sportId?: StringFieldUpdateOperationsInput | string
  }

  export type MemberMembershipCreateManyMembershipPlanInput = {
    id?: string
    memberId: string
    startDate: Date | string
    endDate: Date | string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttendanceCreateManyMembershipPlanInput = {
    id?: string
    memberId: string
    date?: Date | string
    status?: string
    sportId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type MemberMembershipUpdateWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: MemberUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MemberMembershipUncheckedUpdateWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberMembershipUncheckedUpdateManyWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUpdateWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    member?: MemberUpdateOneRequiredWithoutAttendancesNestedInput
    sport?: SportUpdateOneWithoutAttendancesNestedInput
  }

  export type AttendanceUncheckedUpdateWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyWithoutMembershipPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    memberId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    sportId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}