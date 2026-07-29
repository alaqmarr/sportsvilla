
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
 * Model WhatsAppMessage
 * 
 */
export type WhatsAppMessage = $Result.DefaultSelection<Prisma.$WhatsAppMessagePayload>
/**
 * Model WhatsAppOtp
 * 
 */
export type WhatsAppOtp = $Result.DefaultSelection<Prisma.$WhatsAppOtpPayload>
/**
 * Model WhatsAppWebhookLog
 * 
 */
export type WhatsAppWebhookLog = $Result.DefaultSelection<Prisma.$WhatsAppWebhookLogPayload>
/**
 * Model WhatsAppConfig
 * 
 */
export type WhatsAppConfig = $Result.DefaultSelection<Prisma.$WhatsAppConfigPayload>
/**
 * Model WhatsAppConversation
 * 
 */
export type WhatsAppConversation = $Result.DefaultSelection<Prisma.$WhatsAppConversationPayload>
/**
 * Model WhatsAppAccountMetric
 * 
 */
export type WhatsAppAccountMetric = $Result.DefaultSelection<Prisma.$WhatsAppAccountMetricPayload>
/**
 * Model WhatsAppTemplate
 * 
 */
export type WhatsAppTemplate = $Result.DefaultSelection<Prisma.$WhatsAppTemplatePayload>
/**
 * Model WhatsAppEventTrigger
 * 
 */
export type WhatsAppEventTrigger = $Result.DefaultSelection<Prisma.$WhatsAppEventTriggerPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more WhatsAppMessages
 * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
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
   * // Fetch zero or more WhatsAppMessages
   * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
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
   * `prisma.whatsAppMessage`: Exposes CRUD operations for the **WhatsAppMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppMessages
    * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
    * ```
    */
  get whatsAppMessage(): Prisma.WhatsAppMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppOtp`: Exposes CRUD operations for the **WhatsAppOtp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppOtps
    * const whatsAppOtps = await prisma.whatsAppOtp.findMany()
    * ```
    */
  get whatsAppOtp(): Prisma.WhatsAppOtpDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppWebhookLog`: Exposes CRUD operations for the **WhatsAppWebhookLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppWebhookLogs
    * const whatsAppWebhookLogs = await prisma.whatsAppWebhookLog.findMany()
    * ```
    */
  get whatsAppWebhookLog(): Prisma.WhatsAppWebhookLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppConfig`: Exposes CRUD operations for the **WhatsAppConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppConfigs
    * const whatsAppConfigs = await prisma.whatsAppConfig.findMany()
    * ```
    */
  get whatsAppConfig(): Prisma.WhatsAppConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppConversation`: Exposes CRUD operations for the **WhatsAppConversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppConversations
    * const whatsAppConversations = await prisma.whatsAppConversation.findMany()
    * ```
    */
  get whatsAppConversation(): Prisma.WhatsAppConversationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppAccountMetric`: Exposes CRUD operations for the **WhatsAppAccountMetric** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppAccountMetrics
    * const whatsAppAccountMetrics = await prisma.whatsAppAccountMetric.findMany()
    * ```
    */
  get whatsAppAccountMetric(): Prisma.WhatsAppAccountMetricDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppTemplate`: Exposes CRUD operations for the **WhatsAppTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppTemplates
    * const whatsAppTemplates = await prisma.whatsAppTemplate.findMany()
    * ```
    */
  get whatsAppTemplate(): Prisma.WhatsAppTemplateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsAppEventTrigger`: Exposes CRUD operations for the **WhatsAppEventTrigger** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WhatsAppEventTriggers
    * const whatsAppEventTriggers = await prisma.whatsAppEventTrigger.findMany()
    * ```
    */
  get whatsAppEventTrigger(): Prisma.WhatsAppEventTriggerDelegate<ExtArgs, ClientOptions>;
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
    WhatsAppMessage: 'WhatsAppMessage',
    WhatsAppOtp: 'WhatsAppOtp',
    WhatsAppWebhookLog: 'WhatsAppWebhookLog',
    WhatsAppConfig: 'WhatsAppConfig',
    WhatsAppConversation: 'WhatsAppConversation',
    WhatsAppAccountMetric: 'WhatsAppAccountMetric',
    WhatsAppTemplate: 'WhatsAppTemplate',
    WhatsAppEventTrigger: 'WhatsAppEventTrigger'
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
      modelProps: "whatsAppMessage" | "whatsAppOtp" | "whatsAppWebhookLog" | "whatsAppConfig" | "whatsAppConversation" | "whatsAppAccountMetric" | "whatsAppTemplate" | "whatsAppEventTrigger"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      WhatsAppMessage: {
        payload: Prisma.$WhatsAppMessagePayload<ExtArgs>
        fields: Prisma.WhatsAppMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          findFirst: {
            args: Prisma.WhatsAppMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          findMany: {
            args: Prisma.WhatsAppMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          create: {
            args: Prisma.WhatsAppMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          createMany: {
            args: Prisma.WhatsAppMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          delete: {
            args: Prisma.WhatsAppMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          update: {
            args: Prisma.WhatsAppMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppMessagePayload>
          }
          aggregate: {
            args: Prisma.WhatsAppMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppMessage>
          }
          groupBy: {
            args: Prisma.WhatsAppMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppMessageCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppMessageCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppOtp: {
        payload: Prisma.$WhatsAppOtpPayload<ExtArgs>
        fields: Prisma.WhatsAppOtpFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppOtpFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppOtpFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppOtpFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppOtpFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          findMany: {
            args: Prisma.WhatsAppOtpFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>[]
          }
          create: {
            args: Prisma.WhatsAppOtpCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          createMany: {
            args: Prisma.WhatsAppOtpCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppOtpCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppOtpDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          update: {
            args: Prisma.WhatsAppOtpUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppOtpDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppOtpUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppOtpUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppOtpUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppOtpPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppOtpAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppOtp>
          }
          groupBy: {
            args: Prisma.WhatsAppOtpGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppOtpGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppOtpCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppOtpCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppWebhookLog: {
        payload: Prisma.$WhatsAppWebhookLogPayload<ExtArgs>
        fields: Prisma.WhatsAppWebhookLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppWebhookLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppWebhookLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppWebhookLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppWebhookLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          findMany: {
            args: Prisma.WhatsAppWebhookLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>[]
          }
          create: {
            args: Prisma.WhatsAppWebhookLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          createMany: {
            args: Prisma.WhatsAppWebhookLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppWebhookLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppWebhookLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          update: {
            args: Prisma.WhatsAppWebhookLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppWebhookLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppWebhookLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppWebhookLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppWebhookLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppWebhookLogPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppWebhookLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppWebhookLog>
          }
          groupBy: {
            args: Prisma.WhatsAppWebhookLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppWebhookLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppWebhookLogCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppWebhookLogCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppConfig: {
        payload: Prisma.$WhatsAppConfigPayload<ExtArgs>
        fields: Prisma.WhatsAppConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          findMany: {
            args: Prisma.WhatsAppConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>[]
          }
          create: {
            args: Prisma.WhatsAppConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          createMany: {
            args: Prisma.WhatsAppConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          update: {
            args: Prisma.WhatsAppConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConfigPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppConfig>
          }
          groupBy: {
            args: Prisma.WhatsAppConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppConfigCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppConfigCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppConversation: {
        payload: Prisma.$WhatsAppConversationPayload<ExtArgs>
        fields: Prisma.WhatsAppConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          findMany: {
            args: Prisma.WhatsAppConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>[]
          }
          create: {
            args: Prisma.WhatsAppConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          createMany: {
            args: Prisma.WhatsAppConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          update: {
            args: Prisma.WhatsAppConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppConversationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppConversationPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppConversation>
          }
          groupBy: {
            args: Prisma.WhatsAppConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppConversationCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppConversationCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppAccountMetric: {
        payload: Prisma.$WhatsAppAccountMetricPayload<ExtArgs>
        fields: Prisma.WhatsAppAccountMetricFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppAccountMetricFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppAccountMetricFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppAccountMetricFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppAccountMetricFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          findMany: {
            args: Prisma.WhatsAppAccountMetricFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>[]
          }
          create: {
            args: Prisma.WhatsAppAccountMetricCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          createMany: {
            args: Prisma.WhatsAppAccountMetricCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppAccountMetricCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppAccountMetricDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          update: {
            args: Prisma.WhatsAppAccountMetricUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppAccountMetricDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppAccountMetricUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppAccountMetricUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppAccountMetricUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppAccountMetricPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppAccountMetricAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppAccountMetric>
          }
          groupBy: {
            args: Prisma.WhatsAppAccountMetricGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppAccountMetricGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppAccountMetricCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppAccountMetricCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppTemplate: {
        payload: Prisma.$WhatsAppTemplatePayload<ExtArgs>
        fields: Prisma.WhatsAppTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          findFirst: {
            args: Prisma.WhatsAppTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          findMany: {
            args: Prisma.WhatsAppTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>[]
          }
          create: {
            args: Prisma.WhatsAppTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          createMany: {
            args: Prisma.WhatsAppTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>[]
          }
          delete: {
            args: Prisma.WhatsAppTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          update: {
            args: Prisma.WhatsAppTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppTemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppTemplatePayload>
          }
          aggregate: {
            args: Prisma.WhatsAppTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppTemplate>
          }
          groupBy: {
            args: Prisma.WhatsAppTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppTemplateCountAggregateOutputType> | number
          }
        }
      }
      WhatsAppEventTrigger: {
        payload: Prisma.$WhatsAppEventTriggerPayload<ExtArgs>
        fields: Prisma.WhatsAppEventTriggerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WhatsAppEventTriggerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WhatsAppEventTriggerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          findFirst: {
            args: Prisma.WhatsAppEventTriggerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WhatsAppEventTriggerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          findMany: {
            args: Prisma.WhatsAppEventTriggerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>[]
          }
          create: {
            args: Prisma.WhatsAppEventTriggerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          createMany: {
            args: Prisma.WhatsAppEventTriggerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WhatsAppEventTriggerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>[]
          }
          delete: {
            args: Prisma.WhatsAppEventTriggerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          update: {
            args: Prisma.WhatsAppEventTriggerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          deleteMany: {
            args: Prisma.WhatsAppEventTriggerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WhatsAppEventTriggerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WhatsAppEventTriggerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>[]
          }
          upsert: {
            args: Prisma.WhatsAppEventTriggerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WhatsAppEventTriggerPayload>
          }
          aggregate: {
            args: Prisma.WhatsAppEventTriggerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsAppEventTrigger>
          }
          groupBy: {
            args: Prisma.WhatsAppEventTriggerGroupByArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppEventTriggerGroupByOutputType>[]
          }
          count: {
            args: Prisma.WhatsAppEventTriggerCountArgs<ExtArgs>
            result: $Utils.Optional<WhatsAppEventTriggerCountAggregateOutputType> | number
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
    whatsAppMessage?: WhatsAppMessageOmit
    whatsAppOtp?: WhatsAppOtpOmit
    whatsAppWebhookLog?: WhatsAppWebhookLogOmit
    whatsAppConfig?: WhatsAppConfigOmit
    whatsAppConversation?: WhatsAppConversationOmit
    whatsAppAccountMetric?: WhatsAppAccountMetricOmit
    whatsAppTemplate?: WhatsAppTemplateOmit
    whatsAppEventTrigger?: WhatsAppEventTriggerOmit
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
   * Models
   */

  /**
   * Model WhatsAppMessage
   */

  export type AggregateWhatsAppMessage = {
    _count: WhatsAppMessageCountAggregateOutputType | null
    _min: WhatsAppMessageMinAggregateOutputType | null
    _max: WhatsAppMessageMaxAggregateOutputType | null
  }

  export type WhatsAppMessageMinAggregateOutputType = {
    id: string | null
    wamid: string | null
    phoneNumber: string | null
    direction: string | null
    type: string | null
    content: string | null
    status: string | null
    errorCode: string | null
    errorMessage: string | null
    metadata: string | null
    isOptOut: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WhatsAppMessageMaxAggregateOutputType = {
    id: string | null
    wamid: string | null
    phoneNumber: string | null
    direction: string | null
    type: string | null
    content: string | null
    status: string | null
    errorCode: string | null
    errorMessage: string | null
    metadata: string | null
    isOptOut: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WhatsAppMessageCountAggregateOutputType = {
    id: number
    wamid: number
    phoneNumber: number
    direction: number
    type: number
    content: number
    status: number
    errorCode: number
    errorMessage: number
    metadata: number
    isOptOut: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WhatsAppMessageMinAggregateInputType = {
    id?: true
    wamid?: true
    phoneNumber?: true
    direction?: true
    type?: true
    content?: true
    status?: true
    errorCode?: true
    errorMessage?: true
    metadata?: true
    isOptOut?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WhatsAppMessageMaxAggregateInputType = {
    id?: true
    wamid?: true
    phoneNumber?: true
    direction?: true
    type?: true
    content?: true
    status?: true
    errorCode?: true
    errorMessage?: true
    metadata?: true
    isOptOut?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WhatsAppMessageCountAggregateInputType = {
    id?: true
    wamid?: true
    phoneNumber?: true
    direction?: true
    type?: true
    content?: true
    status?: true
    errorCode?: true
    errorMessage?: true
    metadata?: true
    isOptOut?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WhatsAppMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppMessage to aggregate.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppMessages
    **/
    _count?: true | WhatsAppMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppMessageMaxAggregateInputType
  }

  export type GetWhatsAppMessageAggregateType<T extends WhatsAppMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppMessage[P]>
      : GetScalarType<T[P], AggregateWhatsAppMessage[P]>
  }




  export type WhatsAppMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppMessageWhereInput
    orderBy?: WhatsAppMessageOrderByWithAggregationInput | WhatsAppMessageOrderByWithAggregationInput[]
    by: WhatsAppMessageScalarFieldEnum[] | WhatsAppMessageScalarFieldEnum
    having?: WhatsAppMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppMessageCountAggregateInputType | true
    _min?: WhatsAppMessageMinAggregateInputType
    _max?: WhatsAppMessageMaxAggregateInputType
  }

  export type WhatsAppMessageGroupByOutputType = {
    id: string
    wamid: string | null
    phoneNumber: string
    direction: string
    type: string
    content: string
    status: string
    errorCode: string | null
    errorMessage: string | null
    metadata: string | null
    isOptOut: boolean
    createdAt: Date
    updatedAt: Date
    _count: WhatsAppMessageCountAggregateOutputType | null
    _min: WhatsAppMessageMinAggregateOutputType | null
    _max: WhatsAppMessageMaxAggregateOutputType | null
  }

  type GetWhatsAppMessageGroupByPayload<T extends WhatsAppMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppMessageGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppMessageGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wamid?: boolean
    phoneNumber?: boolean
    direction?: boolean
    type?: boolean
    content?: boolean
    status?: boolean
    errorCode?: boolean
    errorMessage?: boolean
    metadata?: boolean
    isOptOut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wamid?: boolean
    phoneNumber?: boolean
    direction?: boolean
    type?: boolean
    content?: boolean
    status?: boolean
    errorCode?: boolean
    errorMessage?: boolean
    metadata?: boolean
    isOptOut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wamid?: boolean
    phoneNumber?: boolean
    direction?: boolean
    type?: boolean
    content?: boolean
    status?: boolean
    errorCode?: boolean
    errorMessage?: boolean
    metadata?: boolean
    isOptOut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppMessage"]>

  export type WhatsAppMessageSelectScalar = {
    id?: boolean
    wamid?: boolean
    phoneNumber?: boolean
    direction?: boolean
    type?: boolean
    content?: boolean
    status?: boolean
    errorCode?: boolean
    errorMessage?: boolean
    metadata?: boolean
    isOptOut?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wamid" | "phoneNumber" | "direction" | "type" | "content" | "status" | "errorCode" | "errorMessage" | "metadata" | "isOptOut" | "createdAt" | "updatedAt", ExtArgs["result"]["whatsAppMessage"]>

  export type $WhatsAppMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppMessage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wamid: string | null
      phoneNumber: string
      direction: string
      type: string
      content: string
      status: string
      errorCode: string | null
      errorMessage: string | null
      metadata: string | null
      isOptOut: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["whatsAppMessage"]>
    composites: {}
  }

  type WhatsAppMessageGetPayload<S extends boolean | null | undefined | WhatsAppMessageDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppMessagePayload, S>

  type WhatsAppMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppMessageCountAggregateInputType | true
    }

  export interface WhatsAppMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppMessage'], meta: { name: 'WhatsAppMessage' } }
    /**
     * Find zero or one WhatsAppMessage that matches the filter.
     * @param {WhatsAppMessageFindUniqueArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppMessageFindUniqueArgs>(args: SelectSubset<T, WhatsAppMessageFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppMessageFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindFirstArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppMessageFindFirstArgs>(args?: SelectSubset<T, WhatsAppMessageFindFirstArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindFirstOrThrowArgs} args - Arguments to find a WhatsAppMessage
     * @example
     * // Get one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppMessages
     * const whatsAppMessages = await prisma.whatsAppMessage.findMany()
     * 
     * // Get first 10 WhatsAppMessages
     * const whatsAppMessages = await prisma.whatsAppMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppMessageFindManyArgs>(args?: SelectSubset<T, WhatsAppMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppMessage.
     * @param {WhatsAppMessageCreateArgs} args - Arguments to create a WhatsAppMessage.
     * @example
     * // Create one WhatsAppMessage
     * const WhatsAppMessage = await prisma.whatsAppMessage.create({
     *   data: {
     *     // ... data to create a WhatsAppMessage
     *   }
     * })
     * 
     */
    create<T extends WhatsAppMessageCreateArgs>(args: SelectSubset<T, WhatsAppMessageCreateArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppMessages.
     * @param {WhatsAppMessageCreateManyArgs} args - Arguments to create many WhatsAppMessages.
     * @example
     * // Create many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppMessageCreateManyArgs>(args?: SelectSubset<T, WhatsAppMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppMessages and returns the data saved in the database.
     * @param {WhatsAppMessageCreateManyAndReturnArgs} args - Arguments to create many WhatsAppMessages.
     * @example
     * // Create many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppMessages and only return the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppMessage.
     * @param {WhatsAppMessageDeleteArgs} args - Arguments to delete one WhatsAppMessage.
     * @example
     * // Delete one WhatsAppMessage
     * const WhatsAppMessage = await prisma.whatsAppMessage.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppMessage
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppMessageDeleteArgs>(args: SelectSubset<T, WhatsAppMessageDeleteArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppMessage.
     * @param {WhatsAppMessageUpdateArgs} args - Arguments to update one WhatsAppMessage.
     * @example
     * // Update one WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppMessageUpdateArgs>(args: SelectSubset<T, WhatsAppMessageUpdateArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppMessages.
     * @param {WhatsAppMessageDeleteManyArgs} args - Arguments to filter WhatsAppMessages to delete.
     * @example
     * // Delete a few WhatsAppMessages
     * const { count } = await prisma.whatsAppMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppMessageDeleteManyArgs>(args?: SelectSubset<T, WhatsAppMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppMessageUpdateManyArgs>(args: SelectSubset<T, WhatsAppMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppMessages and returns the data updated in the database.
     * @param {WhatsAppMessageUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppMessages.
     * @example
     * // Update many WhatsAppMessages
     * const whatsAppMessage = await prisma.whatsAppMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppMessages and only return the `id`
     * const whatsAppMessageWithIdOnly = await prisma.whatsAppMessage.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppMessage.
     * @param {WhatsAppMessageUpsertArgs} args - Arguments to update or create a WhatsAppMessage.
     * @example
     * // Update or create a WhatsAppMessage
     * const whatsAppMessage = await prisma.whatsAppMessage.upsert({
     *   create: {
     *     // ... data to create a WhatsAppMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppMessage we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppMessageUpsertArgs>(args: SelectSubset<T, WhatsAppMessageUpsertArgs<ExtArgs>>): Prisma__WhatsAppMessageClient<$Result.GetResult<Prisma.$WhatsAppMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageCountArgs} args - Arguments to filter WhatsAppMessages to count.
     * @example
     * // Count the number of WhatsAppMessages
     * const count = await prisma.whatsAppMessage.count({
     *   where: {
     *     // ... the filter for the WhatsAppMessages we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppMessageCountArgs>(
      args?: Subset<T, WhatsAppMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppMessageAggregateArgs>(args: Subset<T, WhatsAppMessageAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppMessageAggregateType<T>>

    /**
     * Group by WhatsAppMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppMessageGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppMessageGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppMessageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppMessage model
   */
  readonly fields: WhatsAppMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppMessage model
   */
  interface WhatsAppMessageFieldRefs {
    readonly id: FieldRef<"WhatsAppMessage", 'String'>
    readonly wamid: FieldRef<"WhatsAppMessage", 'String'>
    readonly phoneNumber: FieldRef<"WhatsAppMessage", 'String'>
    readonly direction: FieldRef<"WhatsAppMessage", 'String'>
    readonly type: FieldRef<"WhatsAppMessage", 'String'>
    readonly content: FieldRef<"WhatsAppMessage", 'String'>
    readonly status: FieldRef<"WhatsAppMessage", 'String'>
    readonly errorCode: FieldRef<"WhatsAppMessage", 'String'>
    readonly errorMessage: FieldRef<"WhatsAppMessage", 'String'>
    readonly metadata: FieldRef<"WhatsAppMessage", 'String'>
    readonly isOptOut: FieldRef<"WhatsAppMessage", 'Boolean'>
    readonly createdAt: FieldRef<"WhatsAppMessage", 'DateTime'>
    readonly updatedAt: FieldRef<"WhatsAppMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppMessage findUnique
   */
  export type WhatsAppMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage findUniqueOrThrow
   */
  export type WhatsAppMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage findFirst
   */
  export type WhatsAppMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppMessages.
     */
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage findFirstOrThrow
   */
  export type WhatsAppMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessage to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppMessages.
     */
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage findMany
   */
  export type WhatsAppMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppMessages to fetch.
     */
    where?: WhatsAppMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppMessages to fetch.
     */
    orderBy?: WhatsAppMessageOrderByWithRelationInput | WhatsAppMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppMessages.
     */
    cursor?: WhatsAppMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppMessages.
     */
    distinct?: WhatsAppMessageScalarFieldEnum | WhatsAppMessageScalarFieldEnum[]
  }

  /**
   * WhatsAppMessage create
   */
  export type WhatsAppMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppMessage.
     */
    data: XOR<WhatsAppMessageCreateInput, WhatsAppMessageUncheckedCreateInput>
  }

  /**
   * WhatsAppMessage createMany
   */
  export type WhatsAppMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppMessages.
     */
    data: WhatsAppMessageCreateManyInput | WhatsAppMessageCreateManyInput[]
  }

  /**
   * WhatsAppMessage createManyAndReturn
   */
  export type WhatsAppMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppMessages.
     */
    data: WhatsAppMessageCreateManyInput | WhatsAppMessageCreateManyInput[]
  }

  /**
   * WhatsAppMessage update
   */
  export type WhatsAppMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppMessage.
     */
    data: XOR<WhatsAppMessageUpdateInput, WhatsAppMessageUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppMessage to update.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage updateMany
   */
  export type WhatsAppMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppMessages.
     */
    data: XOR<WhatsAppMessageUpdateManyMutationInput, WhatsAppMessageUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppMessages to update
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to update.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage updateManyAndReturn
   */
  export type WhatsAppMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppMessages.
     */
    data: XOR<WhatsAppMessageUpdateManyMutationInput, WhatsAppMessageUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppMessages to update
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to update.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage upsert
   */
  export type WhatsAppMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppMessage to update in case it exists.
     */
    where: WhatsAppMessageWhereUniqueInput
    /**
     * In case the WhatsAppMessage found by the `where` argument doesn't exist, create a new WhatsAppMessage with this data.
     */
    create: XOR<WhatsAppMessageCreateInput, WhatsAppMessageUncheckedCreateInput>
    /**
     * In case the WhatsAppMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppMessageUpdateInput, WhatsAppMessageUncheckedUpdateInput>
  }

  /**
   * WhatsAppMessage delete
   */
  export type WhatsAppMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppMessage to delete.
     */
    where: WhatsAppMessageWhereUniqueInput
  }

  /**
   * WhatsAppMessage deleteMany
   */
  export type WhatsAppMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppMessages to delete
     */
    where?: WhatsAppMessageWhereInput
    /**
     * Limit how many WhatsAppMessages to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppMessage without action
   */
  export type WhatsAppMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppMessage
     */
    select?: WhatsAppMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppMessage
     */
    omit?: WhatsAppMessageOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppOtp
   */

  export type AggregateWhatsAppOtp = {
    _count: WhatsAppOtpCountAggregateOutputType | null
    _min: WhatsAppOtpMinAggregateOutputType | null
    _max: WhatsAppOtpMaxAggregateOutputType | null
  }

  export type WhatsAppOtpMinAggregateOutputType = {
    id: string | null
    phoneNumber: string | null
    otp: string | null
    purpose: string | null
    verified: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type WhatsAppOtpMaxAggregateOutputType = {
    id: string | null
    phoneNumber: string | null
    otp: string | null
    purpose: string | null
    verified: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type WhatsAppOtpCountAggregateOutputType = {
    id: number
    phoneNumber: number
    otp: number
    purpose: number
    verified: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type WhatsAppOtpMinAggregateInputType = {
    id?: true
    phoneNumber?: true
    otp?: true
    purpose?: true
    verified?: true
    expiresAt?: true
    createdAt?: true
  }

  export type WhatsAppOtpMaxAggregateInputType = {
    id?: true
    phoneNumber?: true
    otp?: true
    purpose?: true
    verified?: true
    expiresAt?: true
    createdAt?: true
  }

  export type WhatsAppOtpCountAggregateInputType = {
    id?: true
    phoneNumber?: true
    otp?: true
    purpose?: true
    verified?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type WhatsAppOtpAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppOtp to aggregate.
     */
    where?: WhatsAppOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppOtps to fetch.
     */
    orderBy?: WhatsAppOtpOrderByWithRelationInput | WhatsAppOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppOtps
    **/
    _count?: true | WhatsAppOtpCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppOtpMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppOtpMaxAggregateInputType
  }

  export type GetWhatsAppOtpAggregateType<T extends WhatsAppOtpAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppOtp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppOtp[P]>
      : GetScalarType<T[P], AggregateWhatsAppOtp[P]>
  }




  export type WhatsAppOtpGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppOtpWhereInput
    orderBy?: WhatsAppOtpOrderByWithAggregationInput | WhatsAppOtpOrderByWithAggregationInput[]
    by: WhatsAppOtpScalarFieldEnum[] | WhatsAppOtpScalarFieldEnum
    having?: WhatsAppOtpScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppOtpCountAggregateInputType | true
    _min?: WhatsAppOtpMinAggregateInputType
    _max?: WhatsAppOtpMaxAggregateInputType
  }

  export type WhatsAppOtpGroupByOutputType = {
    id: string
    phoneNumber: string
    otp: string
    purpose: string
    verified: boolean
    expiresAt: Date
    createdAt: Date
    _count: WhatsAppOtpCountAggregateOutputType | null
    _min: WhatsAppOtpMinAggregateOutputType | null
    _max: WhatsAppOtpMaxAggregateOutputType | null
  }

  type GetWhatsAppOtpGroupByPayload<T extends WhatsAppOtpGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppOtpGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppOtpGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppOtpGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppOtpGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppOtpSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumber?: boolean
    otp?: boolean
    purpose?: boolean
    verified?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppOtp"]>

  export type WhatsAppOtpSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumber?: boolean
    otp?: boolean
    purpose?: boolean
    verified?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppOtp"]>

  export type WhatsAppOtpSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumber?: boolean
    otp?: boolean
    purpose?: boolean
    verified?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppOtp"]>

  export type WhatsAppOtpSelectScalar = {
    id?: boolean
    phoneNumber?: boolean
    otp?: boolean
    purpose?: boolean
    verified?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type WhatsAppOtpOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phoneNumber" | "otp" | "purpose" | "verified" | "expiresAt" | "createdAt", ExtArgs["result"]["whatsAppOtp"]>

  export type $WhatsAppOtpPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppOtp"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phoneNumber: string
      otp: string
      purpose: string
      verified: boolean
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["whatsAppOtp"]>
    composites: {}
  }

  type WhatsAppOtpGetPayload<S extends boolean | null | undefined | WhatsAppOtpDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppOtpPayload, S>

  type WhatsAppOtpCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppOtpFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppOtpCountAggregateInputType | true
    }

  export interface WhatsAppOtpDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppOtp'], meta: { name: 'WhatsAppOtp' } }
    /**
     * Find zero or one WhatsAppOtp that matches the filter.
     * @param {WhatsAppOtpFindUniqueArgs} args - Arguments to find a WhatsAppOtp
     * @example
     * // Get one WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppOtpFindUniqueArgs>(args: SelectSubset<T, WhatsAppOtpFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppOtp that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppOtpFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppOtp
     * @example
     * // Get one WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppOtpFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppOtpFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppOtp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpFindFirstArgs} args - Arguments to find a WhatsAppOtp
     * @example
     * // Get one WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppOtpFindFirstArgs>(args?: SelectSubset<T, WhatsAppOtpFindFirstArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppOtp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpFindFirstOrThrowArgs} args - Arguments to find a WhatsAppOtp
     * @example
     * // Get one WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppOtpFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppOtpFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppOtps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppOtps
     * const whatsAppOtps = await prisma.whatsAppOtp.findMany()
     * 
     * // Get first 10 WhatsAppOtps
     * const whatsAppOtps = await prisma.whatsAppOtp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppOtpWithIdOnly = await prisma.whatsAppOtp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppOtpFindManyArgs>(args?: SelectSubset<T, WhatsAppOtpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppOtp.
     * @param {WhatsAppOtpCreateArgs} args - Arguments to create a WhatsAppOtp.
     * @example
     * // Create one WhatsAppOtp
     * const WhatsAppOtp = await prisma.whatsAppOtp.create({
     *   data: {
     *     // ... data to create a WhatsAppOtp
     *   }
     * })
     * 
     */
    create<T extends WhatsAppOtpCreateArgs>(args: SelectSubset<T, WhatsAppOtpCreateArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppOtps.
     * @param {WhatsAppOtpCreateManyArgs} args - Arguments to create many WhatsAppOtps.
     * @example
     * // Create many WhatsAppOtps
     * const whatsAppOtp = await prisma.whatsAppOtp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppOtpCreateManyArgs>(args?: SelectSubset<T, WhatsAppOtpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppOtps and returns the data saved in the database.
     * @param {WhatsAppOtpCreateManyAndReturnArgs} args - Arguments to create many WhatsAppOtps.
     * @example
     * // Create many WhatsAppOtps
     * const whatsAppOtp = await prisma.whatsAppOtp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppOtps and only return the `id`
     * const whatsAppOtpWithIdOnly = await prisma.whatsAppOtp.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppOtpCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppOtpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppOtp.
     * @param {WhatsAppOtpDeleteArgs} args - Arguments to delete one WhatsAppOtp.
     * @example
     * // Delete one WhatsAppOtp
     * const WhatsAppOtp = await prisma.whatsAppOtp.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppOtp
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppOtpDeleteArgs>(args: SelectSubset<T, WhatsAppOtpDeleteArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppOtp.
     * @param {WhatsAppOtpUpdateArgs} args - Arguments to update one WhatsAppOtp.
     * @example
     * // Update one WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppOtpUpdateArgs>(args: SelectSubset<T, WhatsAppOtpUpdateArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppOtps.
     * @param {WhatsAppOtpDeleteManyArgs} args - Arguments to filter WhatsAppOtps to delete.
     * @example
     * // Delete a few WhatsAppOtps
     * const { count } = await prisma.whatsAppOtp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppOtpDeleteManyArgs>(args?: SelectSubset<T, WhatsAppOtpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppOtps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppOtps
     * const whatsAppOtp = await prisma.whatsAppOtp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppOtpUpdateManyArgs>(args: SelectSubset<T, WhatsAppOtpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppOtps and returns the data updated in the database.
     * @param {WhatsAppOtpUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppOtps.
     * @example
     * // Update many WhatsAppOtps
     * const whatsAppOtp = await prisma.whatsAppOtp.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppOtps and only return the `id`
     * const whatsAppOtpWithIdOnly = await prisma.whatsAppOtp.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppOtpUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppOtpUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppOtp.
     * @param {WhatsAppOtpUpsertArgs} args - Arguments to update or create a WhatsAppOtp.
     * @example
     * // Update or create a WhatsAppOtp
     * const whatsAppOtp = await prisma.whatsAppOtp.upsert({
     *   create: {
     *     // ... data to create a WhatsAppOtp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppOtp we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppOtpUpsertArgs>(args: SelectSubset<T, WhatsAppOtpUpsertArgs<ExtArgs>>): Prisma__WhatsAppOtpClient<$Result.GetResult<Prisma.$WhatsAppOtpPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppOtps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpCountArgs} args - Arguments to filter WhatsAppOtps to count.
     * @example
     * // Count the number of WhatsAppOtps
     * const count = await prisma.whatsAppOtp.count({
     *   where: {
     *     // ... the filter for the WhatsAppOtps we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppOtpCountArgs>(
      args?: Subset<T, WhatsAppOtpCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppOtpCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppOtp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppOtpAggregateArgs>(args: Subset<T, WhatsAppOtpAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppOtpAggregateType<T>>

    /**
     * Group by WhatsAppOtp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppOtpGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppOtpGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppOtpGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppOtpGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppOtpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppOtpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppOtp model
   */
  readonly fields: WhatsAppOtpFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppOtp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppOtpClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppOtp model
   */
  interface WhatsAppOtpFieldRefs {
    readonly id: FieldRef<"WhatsAppOtp", 'String'>
    readonly phoneNumber: FieldRef<"WhatsAppOtp", 'String'>
    readonly otp: FieldRef<"WhatsAppOtp", 'String'>
    readonly purpose: FieldRef<"WhatsAppOtp", 'String'>
    readonly verified: FieldRef<"WhatsAppOtp", 'Boolean'>
    readonly expiresAt: FieldRef<"WhatsAppOtp", 'DateTime'>
    readonly createdAt: FieldRef<"WhatsAppOtp", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppOtp findUnique
   */
  export type WhatsAppOtpFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppOtp to fetch.
     */
    where: WhatsAppOtpWhereUniqueInput
  }

  /**
   * WhatsAppOtp findUniqueOrThrow
   */
  export type WhatsAppOtpFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppOtp to fetch.
     */
    where: WhatsAppOtpWhereUniqueInput
  }

  /**
   * WhatsAppOtp findFirst
   */
  export type WhatsAppOtpFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppOtp to fetch.
     */
    where?: WhatsAppOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppOtps to fetch.
     */
    orderBy?: WhatsAppOtpOrderByWithRelationInput | WhatsAppOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppOtps.
     */
    cursor?: WhatsAppOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppOtps.
     */
    distinct?: WhatsAppOtpScalarFieldEnum | WhatsAppOtpScalarFieldEnum[]
  }

  /**
   * WhatsAppOtp findFirstOrThrow
   */
  export type WhatsAppOtpFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppOtp to fetch.
     */
    where?: WhatsAppOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppOtps to fetch.
     */
    orderBy?: WhatsAppOtpOrderByWithRelationInput | WhatsAppOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppOtps.
     */
    cursor?: WhatsAppOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppOtps.
     */
    distinct?: WhatsAppOtpScalarFieldEnum | WhatsAppOtpScalarFieldEnum[]
  }

  /**
   * WhatsAppOtp findMany
   */
  export type WhatsAppOtpFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppOtps to fetch.
     */
    where?: WhatsAppOtpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppOtps to fetch.
     */
    orderBy?: WhatsAppOtpOrderByWithRelationInput | WhatsAppOtpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppOtps.
     */
    cursor?: WhatsAppOtpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppOtps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppOtps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppOtps.
     */
    distinct?: WhatsAppOtpScalarFieldEnum | WhatsAppOtpScalarFieldEnum[]
  }

  /**
   * WhatsAppOtp create
   */
  export type WhatsAppOtpCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppOtp.
     */
    data: XOR<WhatsAppOtpCreateInput, WhatsAppOtpUncheckedCreateInput>
  }

  /**
   * WhatsAppOtp createMany
   */
  export type WhatsAppOtpCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppOtps.
     */
    data: WhatsAppOtpCreateManyInput | WhatsAppOtpCreateManyInput[]
  }

  /**
   * WhatsAppOtp createManyAndReturn
   */
  export type WhatsAppOtpCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppOtps.
     */
    data: WhatsAppOtpCreateManyInput | WhatsAppOtpCreateManyInput[]
  }

  /**
   * WhatsAppOtp update
   */
  export type WhatsAppOtpUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppOtp.
     */
    data: XOR<WhatsAppOtpUpdateInput, WhatsAppOtpUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppOtp to update.
     */
    where: WhatsAppOtpWhereUniqueInput
  }

  /**
   * WhatsAppOtp updateMany
   */
  export type WhatsAppOtpUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppOtps.
     */
    data: XOR<WhatsAppOtpUpdateManyMutationInput, WhatsAppOtpUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppOtps to update
     */
    where?: WhatsAppOtpWhereInput
    /**
     * Limit how many WhatsAppOtps to update.
     */
    limit?: number
  }

  /**
   * WhatsAppOtp updateManyAndReturn
   */
  export type WhatsAppOtpUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppOtps.
     */
    data: XOR<WhatsAppOtpUpdateManyMutationInput, WhatsAppOtpUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppOtps to update
     */
    where?: WhatsAppOtpWhereInput
    /**
     * Limit how many WhatsAppOtps to update.
     */
    limit?: number
  }

  /**
   * WhatsAppOtp upsert
   */
  export type WhatsAppOtpUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppOtp to update in case it exists.
     */
    where: WhatsAppOtpWhereUniqueInput
    /**
     * In case the WhatsAppOtp found by the `where` argument doesn't exist, create a new WhatsAppOtp with this data.
     */
    create: XOR<WhatsAppOtpCreateInput, WhatsAppOtpUncheckedCreateInput>
    /**
     * In case the WhatsAppOtp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppOtpUpdateInput, WhatsAppOtpUncheckedUpdateInput>
  }

  /**
   * WhatsAppOtp delete
   */
  export type WhatsAppOtpDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppOtp to delete.
     */
    where: WhatsAppOtpWhereUniqueInput
  }

  /**
   * WhatsAppOtp deleteMany
   */
  export type WhatsAppOtpDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppOtps to delete
     */
    where?: WhatsAppOtpWhereInput
    /**
     * Limit how many WhatsAppOtps to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppOtp without action
   */
  export type WhatsAppOtpDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppOtp
     */
    select?: WhatsAppOtpSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppOtp
     */
    omit?: WhatsAppOtpOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppWebhookLog
   */

  export type AggregateWhatsAppWebhookLog = {
    _count: WhatsAppWebhookLogCountAggregateOutputType | null
    _min: WhatsAppWebhookLogMinAggregateOutputType | null
    _max: WhatsAppWebhookLogMaxAggregateOutputType | null
  }

  export type WhatsAppWebhookLogMinAggregateOutputType = {
    id: string | null
    event: string | null
    payload: string | null
    processed: boolean | null
    createdAt: Date | null
  }

  export type WhatsAppWebhookLogMaxAggregateOutputType = {
    id: string | null
    event: string | null
    payload: string | null
    processed: boolean | null
    createdAt: Date | null
  }

  export type WhatsAppWebhookLogCountAggregateOutputType = {
    id: number
    event: number
    payload: number
    processed: number
    createdAt: number
    _all: number
  }


  export type WhatsAppWebhookLogMinAggregateInputType = {
    id?: true
    event?: true
    payload?: true
    processed?: true
    createdAt?: true
  }

  export type WhatsAppWebhookLogMaxAggregateInputType = {
    id?: true
    event?: true
    payload?: true
    processed?: true
    createdAt?: true
  }

  export type WhatsAppWebhookLogCountAggregateInputType = {
    id?: true
    event?: true
    payload?: true
    processed?: true
    createdAt?: true
    _all?: true
  }

  export type WhatsAppWebhookLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppWebhookLog to aggregate.
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppWebhookLogs to fetch.
     */
    orderBy?: WhatsAppWebhookLogOrderByWithRelationInput | WhatsAppWebhookLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppWebhookLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppWebhookLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppWebhookLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppWebhookLogs
    **/
    _count?: true | WhatsAppWebhookLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppWebhookLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppWebhookLogMaxAggregateInputType
  }

  export type GetWhatsAppWebhookLogAggregateType<T extends WhatsAppWebhookLogAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppWebhookLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppWebhookLog[P]>
      : GetScalarType<T[P], AggregateWhatsAppWebhookLog[P]>
  }




  export type WhatsAppWebhookLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppWebhookLogWhereInput
    orderBy?: WhatsAppWebhookLogOrderByWithAggregationInput | WhatsAppWebhookLogOrderByWithAggregationInput[]
    by: WhatsAppWebhookLogScalarFieldEnum[] | WhatsAppWebhookLogScalarFieldEnum
    having?: WhatsAppWebhookLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppWebhookLogCountAggregateInputType | true
    _min?: WhatsAppWebhookLogMinAggregateInputType
    _max?: WhatsAppWebhookLogMaxAggregateInputType
  }

  export type WhatsAppWebhookLogGroupByOutputType = {
    id: string
    event: string
    payload: string
    processed: boolean
    createdAt: Date
    _count: WhatsAppWebhookLogCountAggregateOutputType | null
    _min: WhatsAppWebhookLogMinAggregateOutputType | null
    _max: WhatsAppWebhookLogMaxAggregateOutputType | null
  }

  type GetWhatsAppWebhookLogGroupByPayload<T extends WhatsAppWebhookLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppWebhookLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppWebhookLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppWebhookLogGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppWebhookLogGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppWebhookLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    event?: boolean
    payload?: boolean
    processed?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppWebhookLog"]>

  export type WhatsAppWebhookLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    event?: boolean
    payload?: boolean
    processed?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppWebhookLog"]>

  export type WhatsAppWebhookLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    event?: boolean
    payload?: boolean
    processed?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppWebhookLog"]>

  export type WhatsAppWebhookLogSelectScalar = {
    id?: boolean
    event?: boolean
    payload?: boolean
    processed?: boolean
    createdAt?: boolean
  }

  export type WhatsAppWebhookLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "event" | "payload" | "processed" | "createdAt", ExtArgs["result"]["whatsAppWebhookLog"]>

  export type $WhatsAppWebhookLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppWebhookLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      event: string
      payload: string
      processed: boolean
      createdAt: Date
    }, ExtArgs["result"]["whatsAppWebhookLog"]>
    composites: {}
  }

  type WhatsAppWebhookLogGetPayload<S extends boolean | null | undefined | WhatsAppWebhookLogDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppWebhookLogPayload, S>

  type WhatsAppWebhookLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppWebhookLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppWebhookLogCountAggregateInputType | true
    }

  export interface WhatsAppWebhookLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppWebhookLog'], meta: { name: 'WhatsAppWebhookLog' } }
    /**
     * Find zero or one WhatsAppWebhookLog that matches the filter.
     * @param {WhatsAppWebhookLogFindUniqueArgs} args - Arguments to find a WhatsAppWebhookLog
     * @example
     * // Get one WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppWebhookLogFindUniqueArgs>(args: SelectSubset<T, WhatsAppWebhookLogFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppWebhookLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppWebhookLogFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppWebhookLog
     * @example
     * // Get one WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppWebhookLogFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppWebhookLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppWebhookLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogFindFirstArgs} args - Arguments to find a WhatsAppWebhookLog
     * @example
     * // Get one WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppWebhookLogFindFirstArgs>(args?: SelectSubset<T, WhatsAppWebhookLogFindFirstArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppWebhookLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogFindFirstOrThrowArgs} args - Arguments to find a WhatsAppWebhookLog
     * @example
     * // Get one WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppWebhookLogFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppWebhookLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppWebhookLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppWebhookLogs
     * const whatsAppWebhookLogs = await prisma.whatsAppWebhookLog.findMany()
     * 
     * // Get first 10 WhatsAppWebhookLogs
     * const whatsAppWebhookLogs = await prisma.whatsAppWebhookLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppWebhookLogWithIdOnly = await prisma.whatsAppWebhookLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppWebhookLogFindManyArgs>(args?: SelectSubset<T, WhatsAppWebhookLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppWebhookLog.
     * @param {WhatsAppWebhookLogCreateArgs} args - Arguments to create a WhatsAppWebhookLog.
     * @example
     * // Create one WhatsAppWebhookLog
     * const WhatsAppWebhookLog = await prisma.whatsAppWebhookLog.create({
     *   data: {
     *     // ... data to create a WhatsAppWebhookLog
     *   }
     * })
     * 
     */
    create<T extends WhatsAppWebhookLogCreateArgs>(args: SelectSubset<T, WhatsAppWebhookLogCreateArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppWebhookLogs.
     * @param {WhatsAppWebhookLogCreateManyArgs} args - Arguments to create many WhatsAppWebhookLogs.
     * @example
     * // Create many WhatsAppWebhookLogs
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppWebhookLogCreateManyArgs>(args?: SelectSubset<T, WhatsAppWebhookLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppWebhookLogs and returns the data saved in the database.
     * @param {WhatsAppWebhookLogCreateManyAndReturnArgs} args - Arguments to create many WhatsAppWebhookLogs.
     * @example
     * // Create many WhatsAppWebhookLogs
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppWebhookLogs and only return the `id`
     * const whatsAppWebhookLogWithIdOnly = await prisma.whatsAppWebhookLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppWebhookLogCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppWebhookLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppWebhookLog.
     * @param {WhatsAppWebhookLogDeleteArgs} args - Arguments to delete one WhatsAppWebhookLog.
     * @example
     * // Delete one WhatsAppWebhookLog
     * const WhatsAppWebhookLog = await prisma.whatsAppWebhookLog.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppWebhookLog
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppWebhookLogDeleteArgs>(args: SelectSubset<T, WhatsAppWebhookLogDeleteArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppWebhookLog.
     * @param {WhatsAppWebhookLogUpdateArgs} args - Arguments to update one WhatsAppWebhookLog.
     * @example
     * // Update one WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppWebhookLogUpdateArgs>(args: SelectSubset<T, WhatsAppWebhookLogUpdateArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppWebhookLogs.
     * @param {WhatsAppWebhookLogDeleteManyArgs} args - Arguments to filter WhatsAppWebhookLogs to delete.
     * @example
     * // Delete a few WhatsAppWebhookLogs
     * const { count } = await prisma.whatsAppWebhookLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppWebhookLogDeleteManyArgs>(args?: SelectSubset<T, WhatsAppWebhookLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppWebhookLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppWebhookLogs
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppWebhookLogUpdateManyArgs>(args: SelectSubset<T, WhatsAppWebhookLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppWebhookLogs and returns the data updated in the database.
     * @param {WhatsAppWebhookLogUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppWebhookLogs.
     * @example
     * // Update many WhatsAppWebhookLogs
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppWebhookLogs and only return the `id`
     * const whatsAppWebhookLogWithIdOnly = await prisma.whatsAppWebhookLog.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppWebhookLogUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppWebhookLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppWebhookLog.
     * @param {WhatsAppWebhookLogUpsertArgs} args - Arguments to update or create a WhatsAppWebhookLog.
     * @example
     * // Update or create a WhatsAppWebhookLog
     * const whatsAppWebhookLog = await prisma.whatsAppWebhookLog.upsert({
     *   create: {
     *     // ... data to create a WhatsAppWebhookLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppWebhookLog we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppWebhookLogUpsertArgs>(args: SelectSubset<T, WhatsAppWebhookLogUpsertArgs<ExtArgs>>): Prisma__WhatsAppWebhookLogClient<$Result.GetResult<Prisma.$WhatsAppWebhookLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppWebhookLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogCountArgs} args - Arguments to filter WhatsAppWebhookLogs to count.
     * @example
     * // Count the number of WhatsAppWebhookLogs
     * const count = await prisma.whatsAppWebhookLog.count({
     *   where: {
     *     // ... the filter for the WhatsAppWebhookLogs we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppWebhookLogCountArgs>(
      args?: Subset<T, WhatsAppWebhookLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppWebhookLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppWebhookLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppWebhookLogAggregateArgs>(args: Subset<T, WhatsAppWebhookLogAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppWebhookLogAggregateType<T>>

    /**
     * Group by WhatsAppWebhookLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppWebhookLogGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppWebhookLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppWebhookLogGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppWebhookLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppWebhookLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppWebhookLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppWebhookLog model
   */
  readonly fields: WhatsAppWebhookLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppWebhookLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppWebhookLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppWebhookLog model
   */
  interface WhatsAppWebhookLogFieldRefs {
    readonly id: FieldRef<"WhatsAppWebhookLog", 'String'>
    readonly event: FieldRef<"WhatsAppWebhookLog", 'String'>
    readonly payload: FieldRef<"WhatsAppWebhookLog", 'String'>
    readonly processed: FieldRef<"WhatsAppWebhookLog", 'Boolean'>
    readonly createdAt: FieldRef<"WhatsAppWebhookLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppWebhookLog findUnique
   */
  export type WhatsAppWebhookLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppWebhookLog to fetch.
     */
    where: WhatsAppWebhookLogWhereUniqueInput
  }

  /**
   * WhatsAppWebhookLog findUniqueOrThrow
   */
  export type WhatsAppWebhookLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppWebhookLog to fetch.
     */
    where: WhatsAppWebhookLogWhereUniqueInput
  }

  /**
   * WhatsAppWebhookLog findFirst
   */
  export type WhatsAppWebhookLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppWebhookLog to fetch.
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppWebhookLogs to fetch.
     */
    orderBy?: WhatsAppWebhookLogOrderByWithRelationInput | WhatsAppWebhookLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppWebhookLogs.
     */
    cursor?: WhatsAppWebhookLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppWebhookLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppWebhookLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppWebhookLogs.
     */
    distinct?: WhatsAppWebhookLogScalarFieldEnum | WhatsAppWebhookLogScalarFieldEnum[]
  }

  /**
   * WhatsAppWebhookLog findFirstOrThrow
   */
  export type WhatsAppWebhookLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppWebhookLog to fetch.
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppWebhookLogs to fetch.
     */
    orderBy?: WhatsAppWebhookLogOrderByWithRelationInput | WhatsAppWebhookLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppWebhookLogs.
     */
    cursor?: WhatsAppWebhookLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppWebhookLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppWebhookLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppWebhookLogs.
     */
    distinct?: WhatsAppWebhookLogScalarFieldEnum | WhatsAppWebhookLogScalarFieldEnum[]
  }

  /**
   * WhatsAppWebhookLog findMany
   */
  export type WhatsAppWebhookLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppWebhookLogs to fetch.
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppWebhookLogs to fetch.
     */
    orderBy?: WhatsAppWebhookLogOrderByWithRelationInput | WhatsAppWebhookLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppWebhookLogs.
     */
    cursor?: WhatsAppWebhookLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppWebhookLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppWebhookLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppWebhookLogs.
     */
    distinct?: WhatsAppWebhookLogScalarFieldEnum | WhatsAppWebhookLogScalarFieldEnum[]
  }

  /**
   * WhatsAppWebhookLog create
   */
  export type WhatsAppWebhookLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppWebhookLog.
     */
    data: XOR<WhatsAppWebhookLogCreateInput, WhatsAppWebhookLogUncheckedCreateInput>
  }

  /**
   * WhatsAppWebhookLog createMany
   */
  export type WhatsAppWebhookLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppWebhookLogs.
     */
    data: WhatsAppWebhookLogCreateManyInput | WhatsAppWebhookLogCreateManyInput[]
  }

  /**
   * WhatsAppWebhookLog createManyAndReturn
   */
  export type WhatsAppWebhookLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppWebhookLogs.
     */
    data: WhatsAppWebhookLogCreateManyInput | WhatsAppWebhookLogCreateManyInput[]
  }

  /**
   * WhatsAppWebhookLog update
   */
  export type WhatsAppWebhookLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppWebhookLog.
     */
    data: XOR<WhatsAppWebhookLogUpdateInput, WhatsAppWebhookLogUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppWebhookLog to update.
     */
    where: WhatsAppWebhookLogWhereUniqueInput
  }

  /**
   * WhatsAppWebhookLog updateMany
   */
  export type WhatsAppWebhookLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppWebhookLogs.
     */
    data: XOR<WhatsAppWebhookLogUpdateManyMutationInput, WhatsAppWebhookLogUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppWebhookLogs to update
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * Limit how many WhatsAppWebhookLogs to update.
     */
    limit?: number
  }

  /**
   * WhatsAppWebhookLog updateManyAndReturn
   */
  export type WhatsAppWebhookLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppWebhookLogs.
     */
    data: XOR<WhatsAppWebhookLogUpdateManyMutationInput, WhatsAppWebhookLogUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppWebhookLogs to update
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * Limit how many WhatsAppWebhookLogs to update.
     */
    limit?: number
  }

  /**
   * WhatsAppWebhookLog upsert
   */
  export type WhatsAppWebhookLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppWebhookLog to update in case it exists.
     */
    where: WhatsAppWebhookLogWhereUniqueInput
    /**
     * In case the WhatsAppWebhookLog found by the `where` argument doesn't exist, create a new WhatsAppWebhookLog with this data.
     */
    create: XOR<WhatsAppWebhookLogCreateInput, WhatsAppWebhookLogUncheckedCreateInput>
    /**
     * In case the WhatsAppWebhookLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppWebhookLogUpdateInput, WhatsAppWebhookLogUncheckedUpdateInput>
  }

  /**
   * WhatsAppWebhookLog delete
   */
  export type WhatsAppWebhookLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppWebhookLog to delete.
     */
    where: WhatsAppWebhookLogWhereUniqueInput
  }

  /**
   * WhatsAppWebhookLog deleteMany
   */
  export type WhatsAppWebhookLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppWebhookLogs to delete
     */
    where?: WhatsAppWebhookLogWhereInput
    /**
     * Limit how many WhatsAppWebhookLogs to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppWebhookLog without action
   */
  export type WhatsAppWebhookLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppWebhookLog
     */
    select?: WhatsAppWebhookLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppWebhookLog
     */
    omit?: WhatsAppWebhookLogOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppConfig
   */

  export type AggregateWhatsAppConfig = {
    _count: WhatsAppConfigCountAggregateOutputType | null
    _min: WhatsAppConfigMinAggregateOutputType | null
    _max: WhatsAppConfigMaxAggregateOutputType | null
  }

  export type WhatsAppConfigMinAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type WhatsAppConfigMaxAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type WhatsAppConfigCountAggregateOutputType = {
    key: number
    value: number
    updatedAt: number
    _all: number
  }


  export type WhatsAppConfigMinAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type WhatsAppConfigMaxAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type WhatsAppConfigCountAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
    _all?: true
  }

  export type WhatsAppConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppConfig to aggregate.
     */
    where?: WhatsAppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConfigs to fetch.
     */
    orderBy?: WhatsAppConfigOrderByWithRelationInput | WhatsAppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppConfigs
    **/
    _count?: true | WhatsAppConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppConfigMaxAggregateInputType
  }

  export type GetWhatsAppConfigAggregateType<T extends WhatsAppConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppConfig[P]>
      : GetScalarType<T[P], AggregateWhatsAppConfig[P]>
  }




  export type WhatsAppConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppConfigWhereInput
    orderBy?: WhatsAppConfigOrderByWithAggregationInput | WhatsAppConfigOrderByWithAggregationInput[]
    by: WhatsAppConfigScalarFieldEnum[] | WhatsAppConfigScalarFieldEnum
    having?: WhatsAppConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppConfigCountAggregateInputType | true
    _min?: WhatsAppConfigMinAggregateInputType
    _max?: WhatsAppConfigMaxAggregateInputType
  }

  export type WhatsAppConfigGroupByOutputType = {
    key: string
    value: string
    updatedAt: Date
    _count: WhatsAppConfigCountAggregateOutputType | null
    _min: WhatsAppConfigMinAggregateOutputType | null
    _max: WhatsAppConfigMaxAggregateOutputType | null
  }

  type GetWhatsAppConfigGroupByPayload<T extends WhatsAppConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppConfigGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppConfigGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppConfig"]>

  export type WhatsAppConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppConfig"]>

  export type WhatsAppConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppConfig"]>

  export type WhatsAppConfigSelectScalar = {
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"key" | "value" | "updatedAt", ExtArgs["result"]["whatsAppConfig"]>

  export type $WhatsAppConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
      updatedAt: Date
    }, ExtArgs["result"]["whatsAppConfig"]>
    composites: {}
  }

  type WhatsAppConfigGetPayload<S extends boolean | null | undefined | WhatsAppConfigDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppConfigPayload, S>

  type WhatsAppConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppConfigCountAggregateInputType | true
    }

  export interface WhatsAppConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppConfig'], meta: { name: 'WhatsAppConfig' } }
    /**
     * Find zero or one WhatsAppConfig that matches the filter.
     * @param {WhatsAppConfigFindUniqueArgs} args - Arguments to find a WhatsAppConfig
     * @example
     * // Get one WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppConfigFindUniqueArgs>(args: SelectSubset<T, WhatsAppConfigFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppConfigFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppConfig
     * @example
     * // Get one WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigFindFirstArgs} args - Arguments to find a WhatsAppConfig
     * @example
     * // Get one WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppConfigFindFirstArgs>(args?: SelectSubset<T, WhatsAppConfigFindFirstArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigFindFirstOrThrowArgs} args - Arguments to find a WhatsAppConfig
     * @example
     * // Get one WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppConfigs
     * const whatsAppConfigs = await prisma.whatsAppConfig.findMany()
     * 
     * // Get first 10 WhatsAppConfigs
     * const whatsAppConfigs = await prisma.whatsAppConfig.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const whatsAppConfigWithKeyOnly = await prisma.whatsAppConfig.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends WhatsAppConfigFindManyArgs>(args?: SelectSubset<T, WhatsAppConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppConfig.
     * @param {WhatsAppConfigCreateArgs} args - Arguments to create a WhatsAppConfig.
     * @example
     * // Create one WhatsAppConfig
     * const WhatsAppConfig = await prisma.whatsAppConfig.create({
     *   data: {
     *     // ... data to create a WhatsAppConfig
     *   }
     * })
     * 
     */
    create<T extends WhatsAppConfigCreateArgs>(args: SelectSubset<T, WhatsAppConfigCreateArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppConfigs.
     * @param {WhatsAppConfigCreateManyArgs} args - Arguments to create many WhatsAppConfigs.
     * @example
     * // Create many WhatsAppConfigs
     * const whatsAppConfig = await prisma.whatsAppConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppConfigCreateManyArgs>(args?: SelectSubset<T, WhatsAppConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppConfigs and returns the data saved in the database.
     * @param {WhatsAppConfigCreateManyAndReturnArgs} args - Arguments to create many WhatsAppConfigs.
     * @example
     * // Create many WhatsAppConfigs
     * const whatsAppConfig = await prisma.whatsAppConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppConfigs and only return the `key`
     * const whatsAppConfigWithKeyOnly = await prisma.whatsAppConfig.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppConfig.
     * @param {WhatsAppConfigDeleteArgs} args - Arguments to delete one WhatsAppConfig.
     * @example
     * // Delete one WhatsAppConfig
     * const WhatsAppConfig = await prisma.whatsAppConfig.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppConfig
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppConfigDeleteArgs>(args: SelectSubset<T, WhatsAppConfigDeleteArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppConfig.
     * @param {WhatsAppConfigUpdateArgs} args - Arguments to update one WhatsAppConfig.
     * @example
     * // Update one WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppConfigUpdateArgs>(args: SelectSubset<T, WhatsAppConfigUpdateArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppConfigs.
     * @param {WhatsAppConfigDeleteManyArgs} args - Arguments to filter WhatsAppConfigs to delete.
     * @example
     * // Delete a few WhatsAppConfigs
     * const { count } = await prisma.whatsAppConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppConfigDeleteManyArgs>(args?: SelectSubset<T, WhatsAppConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppConfigs
     * const whatsAppConfig = await prisma.whatsAppConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppConfigUpdateManyArgs>(args: SelectSubset<T, WhatsAppConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppConfigs and returns the data updated in the database.
     * @param {WhatsAppConfigUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppConfigs.
     * @example
     * // Update many WhatsAppConfigs
     * const whatsAppConfig = await prisma.whatsAppConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppConfigs and only return the `key`
     * const whatsAppConfigWithKeyOnly = await prisma.whatsAppConfig.updateManyAndReturn({
     *   select: { key: true },
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
    updateManyAndReturn<T extends WhatsAppConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppConfig.
     * @param {WhatsAppConfigUpsertArgs} args - Arguments to update or create a WhatsAppConfig.
     * @example
     * // Update or create a WhatsAppConfig
     * const whatsAppConfig = await prisma.whatsAppConfig.upsert({
     *   create: {
     *     // ... data to create a WhatsAppConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppConfig we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppConfigUpsertArgs>(args: SelectSubset<T, WhatsAppConfigUpsertArgs<ExtArgs>>): Prisma__WhatsAppConfigClient<$Result.GetResult<Prisma.$WhatsAppConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigCountArgs} args - Arguments to filter WhatsAppConfigs to count.
     * @example
     * // Count the number of WhatsAppConfigs
     * const count = await prisma.whatsAppConfig.count({
     *   where: {
     *     // ... the filter for the WhatsAppConfigs we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppConfigCountArgs>(
      args?: Subset<T, WhatsAppConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppConfigAggregateArgs>(args: Subset<T, WhatsAppConfigAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppConfigAggregateType<T>>

    /**
     * Group by WhatsAppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConfigGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppConfigGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppConfig model
   */
  readonly fields: WhatsAppConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppConfig model
   */
  interface WhatsAppConfigFieldRefs {
    readonly key: FieldRef<"WhatsAppConfig", 'String'>
    readonly value: FieldRef<"WhatsAppConfig", 'String'>
    readonly updatedAt: FieldRef<"WhatsAppConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppConfig findUnique
   */
  export type WhatsAppConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConfig to fetch.
     */
    where: WhatsAppConfigWhereUniqueInput
  }

  /**
   * WhatsAppConfig findUniqueOrThrow
   */
  export type WhatsAppConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConfig to fetch.
     */
    where: WhatsAppConfigWhereUniqueInput
  }

  /**
   * WhatsAppConfig findFirst
   */
  export type WhatsAppConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConfig to fetch.
     */
    where?: WhatsAppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConfigs to fetch.
     */
    orderBy?: WhatsAppConfigOrderByWithRelationInput | WhatsAppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppConfigs.
     */
    cursor?: WhatsAppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConfigs.
     */
    distinct?: WhatsAppConfigScalarFieldEnum | WhatsAppConfigScalarFieldEnum[]
  }

  /**
   * WhatsAppConfig findFirstOrThrow
   */
  export type WhatsAppConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConfig to fetch.
     */
    where?: WhatsAppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConfigs to fetch.
     */
    orderBy?: WhatsAppConfigOrderByWithRelationInput | WhatsAppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppConfigs.
     */
    cursor?: WhatsAppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConfigs.
     */
    distinct?: WhatsAppConfigScalarFieldEnum | WhatsAppConfigScalarFieldEnum[]
  }

  /**
   * WhatsAppConfig findMany
   */
  export type WhatsAppConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConfigs to fetch.
     */
    where?: WhatsAppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConfigs to fetch.
     */
    orderBy?: WhatsAppConfigOrderByWithRelationInput | WhatsAppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppConfigs.
     */
    cursor?: WhatsAppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConfigs.
     */
    distinct?: WhatsAppConfigScalarFieldEnum | WhatsAppConfigScalarFieldEnum[]
  }

  /**
   * WhatsAppConfig create
   */
  export type WhatsAppConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppConfig.
     */
    data: XOR<WhatsAppConfigCreateInput, WhatsAppConfigUncheckedCreateInput>
  }

  /**
   * WhatsAppConfig createMany
   */
  export type WhatsAppConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppConfigs.
     */
    data: WhatsAppConfigCreateManyInput | WhatsAppConfigCreateManyInput[]
  }

  /**
   * WhatsAppConfig createManyAndReturn
   */
  export type WhatsAppConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppConfigs.
     */
    data: WhatsAppConfigCreateManyInput | WhatsAppConfigCreateManyInput[]
  }

  /**
   * WhatsAppConfig update
   */
  export type WhatsAppConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppConfig.
     */
    data: XOR<WhatsAppConfigUpdateInput, WhatsAppConfigUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppConfig to update.
     */
    where: WhatsAppConfigWhereUniqueInput
  }

  /**
   * WhatsAppConfig updateMany
   */
  export type WhatsAppConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppConfigs.
     */
    data: XOR<WhatsAppConfigUpdateManyMutationInput, WhatsAppConfigUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppConfigs to update
     */
    where?: WhatsAppConfigWhereInput
    /**
     * Limit how many WhatsAppConfigs to update.
     */
    limit?: number
  }

  /**
   * WhatsAppConfig updateManyAndReturn
   */
  export type WhatsAppConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppConfigs.
     */
    data: XOR<WhatsAppConfigUpdateManyMutationInput, WhatsAppConfigUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppConfigs to update
     */
    where?: WhatsAppConfigWhereInput
    /**
     * Limit how many WhatsAppConfigs to update.
     */
    limit?: number
  }

  /**
   * WhatsAppConfig upsert
   */
  export type WhatsAppConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppConfig to update in case it exists.
     */
    where: WhatsAppConfigWhereUniqueInput
    /**
     * In case the WhatsAppConfig found by the `where` argument doesn't exist, create a new WhatsAppConfig with this data.
     */
    create: XOR<WhatsAppConfigCreateInput, WhatsAppConfigUncheckedCreateInput>
    /**
     * In case the WhatsAppConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppConfigUpdateInput, WhatsAppConfigUncheckedUpdateInput>
  }

  /**
   * WhatsAppConfig delete
   */
  export type WhatsAppConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppConfig to delete.
     */
    where: WhatsAppConfigWhereUniqueInput
  }

  /**
   * WhatsAppConfig deleteMany
   */
  export type WhatsAppConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppConfigs to delete
     */
    where?: WhatsAppConfigWhereInput
    /**
     * Limit how many WhatsAppConfigs to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppConfig without action
   */
  export type WhatsAppConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConfig
     */
    select?: WhatsAppConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConfig
     */
    omit?: WhatsAppConfigOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppConversation
   */

  export type AggregateWhatsAppConversation = {
    _count: WhatsAppConversationCountAggregateOutputType | null
    _avg: WhatsAppConversationAvgAggregateOutputType | null
    _sum: WhatsAppConversationSumAggregateOutputType | null
    _min: WhatsAppConversationMinAggregateOutputType | null
    _max: WhatsAppConversationMaxAggregateOutputType | null
  }

  export type WhatsAppConversationAvgAggregateOutputType = {
    cost: number | null
  }

  export type WhatsAppConversationSumAggregateOutputType = {
    cost: number | null
  }

  export type WhatsAppConversationMinAggregateOutputType = {
    id: string | null
    wacId: string | null
    recipientMobile: string | null
    category: string | null
    isFreeTier: boolean | null
    openedAt: Date | null
    expiresAt: Date | null
    cost: number | null
    createdAt: Date | null
  }

  export type WhatsAppConversationMaxAggregateOutputType = {
    id: string | null
    wacId: string | null
    recipientMobile: string | null
    category: string | null
    isFreeTier: boolean | null
    openedAt: Date | null
    expiresAt: Date | null
    cost: number | null
    createdAt: Date | null
  }

  export type WhatsAppConversationCountAggregateOutputType = {
    id: number
    wacId: number
    recipientMobile: number
    category: number
    isFreeTier: number
    openedAt: number
    expiresAt: number
    cost: number
    createdAt: number
    _all: number
  }


  export type WhatsAppConversationAvgAggregateInputType = {
    cost?: true
  }

  export type WhatsAppConversationSumAggregateInputType = {
    cost?: true
  }

  export type WhatsAppConversationMinAggregateInputType = {
    id?: true
    wacId?: true
    recipientMobile?: true
    category?: true
    isFreeTier?: true
    openedAt?: true
    expiresAt?: true
    cost?: true
    createdAt?: true
  }

  export type WhatsAppConversationMaxAggregateInputType = {
    id?: true
    wacId?: true
    recipientMobile?: true
    category?: true
    isFreeTier?: true
    openedAt?: true
    expiresAt?: true
    cost?: true
    createdAt?: true
  }

  export type WhatsAppConversationCountAggregateInputType = {
    id?: true
    wacId?: true
    recipientMobile?: true
    category?: true
    isFreeTier?: true
    openedAt?: true
    expiresAt?: true
    cost?: true
    createdAt?: true
    _all?: true
  }

  export type WhatsAppConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppConversation to aggregate.
     */
    where?: WhatsAppConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConversations to fetch.
     */
    orderBy?: WhatsAppConversationOrderByWithRelationInput | WhatsAppConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppConversations
    **/
    _count?: true | WhatsAppConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WhatsAppConversationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WhatsAppConversationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppConversationMaxAggregateInputType
  }

  export type GetWhatsAppConversationAggregateType<T extends WhatsAppConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppConversation[P]>
      : GetScalarType<T[P], AggregateWhatsAppConversation[P]>
  }




  export type WhatsAppConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppConversationWhereInput
    orderBy?: WhatsAppConversationOrderByWithAggregationInput | WhatsAppConversationOrderByWithAggregationInput[]
    by: WhatsAppConversationScalarFieldEnum[] | WhatsAppConversationScalarFieldEnum
    having?: WhatsAppConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppConversationCountAggregateInputType | true
    _avg?: WhatsAppConversationAvgAggregateInputType
    _sum?: WhatsAppConversationSumAggregateInputType
    _min?: WhatsAppConversationMinAggregateInputType
    _max?: WhatsAppConversationMaxAggregateInputType
  }

  export type WhatsAppConversationGroupByOutputType = {
    id: string
    wacId: string
    recipientMobile: string
    category: string
    isFreeTier: boolean
    openedAt: Date
    expiresAt: Date
    cost: number
    createdAt: Date
    _count: WhatsAppConversationCountAggregateOutputType | null
    _avg: WhatsAppConversationAvgAggregateOutputType | null
    _sum: WhatsAppConversationSumAggregateOutputType | null
    _min: WhatsAppConversationMinAggregateOutputType | null
    _max: WhatsAppConversationMaxAggregateOutputType | null
  }

  type GetWhatsAppConversationGroupByPayload<T extends WhatsAppConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppConversationGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppConversationGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wacId?: boolean
    recipientMobile?: boolean
    category?: boolean
    isFreeTier?: boolean
    openedAt?: boolean
    expiresAt?: boolean
    cost?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppConversation"]>

  export type WhatsAppConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wacId?: boolean
    recipientMobile?: boolean
    category?: boolean
    isFreeTier?: boolean
    openedAt?: boolean
    expiresAt?: boolean
    cost?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppConversation"]>

  export type WhatsAppConversationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wacId?: boolean
    recipientMobile?: boolean
    category?: boolean
    isFreeTier?: boolean
    openedAt?: boolean
    expiresAt?: boolean
    cost?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["whatsAppConversation"]>

  export type WhatsAppConversationSelectScalar = {
    id?: boolean
    wacId?: boolean
    recipientMobile?: boolean
    category?: boolean
    isFreeTier?: boolean
    openedAt?: boolean
    expiresAt?: boolean
    cost?: boolean
    createdAt?: boolean
  }

  export type WhatsAppConversationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wacId" | "recipientMobile" | "category" | "isFreeTier" | "openedAt" | "expiresAt" | "cost" | "createdAt", ExtArgs["result"]["whatsAppConversation"]>

  export type $WhatsAppConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppConversation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wacId: string
      recipientMobile: string
      category: string
      isFreeTier: boolean
      openedAt: Date
      expiresAt: Date
      cost: number
      createdAt: Date
    }, ExtArgs["result"]["whatsAppConversation"]>
    composites: {}
  }

  type WhatsAppConversationGetPayload<S extends boolean | null | undefined | WhatsAppConversationDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppConversationPayload, S>

  type WhatsAppConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppConversationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppConversationCountAggregateInputType | true
    }

  export interface WhatsAppConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppConversation'], meta: { name: 'WhatsAppConversation' } }
    /**
     * Find zero or one WhatsAppConversation that matches the filter.
     * @param {WhatsAppConversationFindUniqueArgs} args - Arguments to find a WhatsAppConversation
     * @example
     * // Get one WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppConversationFindUniqueArgs>(args: SelectSubset<T, WhatsAppConversationFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppConversation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppConversationFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppConversation
     * @example
     * // Get one WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppConversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationFindFirstArgs} args - Arguments to find a WhatsAppConversation
     * @example
     * // Get one WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppConversationFindFirstArgs>(args?: SelectSubset<T, WhatsAppConversationFindFirstArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppConversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationFindFirstOrThrowArgs} args - Arguments to find a WhatsAppConversation
     * @example
     * // Get one WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppConversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppConversations
     * const whatsAppConversations = await prisma.whatsAppConversation.findMany()
     * 
     * // Get first 10 WhatsAppConversations
     * const whatsAppConversations = await prisma.whatsAppConversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppConversationWithIdOnly = await prisma.whatsAppConversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppConversationFindManyArgs>(args?: SelectSubset<T, WhatsAppConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppConversation.
     * @param {WhatsAppConversationCreateArgs} args - Arguments to create a WhatsAppConversation.
     * @example
     * // Create one WhatsAppConversation
     * const WhatsAppConversation = await prisma.whatsAppConversation.create({
     *   data: {
     *     // ... data to create a WhatsAppConversation
     *   }
     * })
     * 
     */
    create<T extends WhatsAppConversationCreateArgs>(args: SelectSubset<T, WhatsAppConversationCreateArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppConversations.
     * @param {WhatsAppConversationCreateManyArgs} args - Arguments to create many WhatsAppConversations.
     * @example
     * // Create many WhatsAppConversations
     * const whatsAppConversation = await prisma.whatsAppConversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppConversationCreateManyArgs>(args?: SelectSubset<T, WhatsAppConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppConversations and returns the data saved in the database.
     * @param {WhatsAppConversationCreateManyAndReturnArgs} args - Arguments to create many WhatsAppConversations.
     * @example
     * // Create many WhatsAppConversations
     * const whatsAppConversation = await prisma.whatsAppConversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppConversations and only return the `id`
     * const whatsAppConversationWithIdOnly = await prisma.whatsAppConversation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppConversation.
     * @param {WhatsAppConversationDeleteArgs} args - Arguments to delete one WhatsAppConversation.
     * @example
     * // Delete one WhatsAppConversation
     * const WhatsAppConversation = await prisma.whatsAppConversation.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppConversation
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppConversationDeleteArgs>(args: SelectSubset<T, WhatsAppConversationDeleteArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppConversation.
     * @param {WhatsAppConversationUpdateArgs} args - Arguments to update one WhatsAppConversation.
     * @example
     * // Update one WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppConversationUpdateArgs>(args: SelectSubset<T, WhatsAppConversationUpdateArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppConversations.
     * @param {WhatsAppConversationDeleteManyArgs} args - Arguments to filter WhatsAppConversations to delete.
     * @example
     * // Delete a few WhatsAppConversations
     * const { count } = await prisma.whatsAppConversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppConversationDeleteManyArgs>(args?: SelectSubset<T, WhatsAppConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppConversations
     * const whatsAppConversation = await prisma.whatsAppConversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppConversationUpdateManyArgs>(args: SelectSubset<T, WhatsAppConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppConversations and returns the data updated in the database.
     * @param {WhatsAppConversationUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppConversations.
     * @example
     * // Update many WhatsAppConversations
     * const whatsAppConversation = await prisma.whatsAppConversation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppConversations and only return the `id`
     * const whatsAppConversationWithIdOnly = await prisma.whatsAppConversation.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppConversationUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppConversationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppConversation.
     * @param {WhatsAppConversationUpsertArgs} args - Arguments to update or create a WhatsAppConversation.
     * @example
     * // Update or create a WhatsAppConversation
     * const whatsAppConversation = await prisma.whatsAppConversation.upsert({
     *   create: {
     *     // ... data to create a WhatsAppConversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppConversation we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppConversationUpsertArgs>(args: SelectSubset<T, WhatsAppConversationUpsertArgs<ExtArgs>>): Prisma__WhatsAppConversationClient<$Result.GetResult<Prisma.$WhatsAppConversationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationCountArgs} args - Arguments to filter WhatsAppConversations to count.
     * @example
     * // Count the number of WhatsAppConversations
     * const count = await prisma.whatsAppConversation.count({
     *   where: {
     *     // ... the filter for the WhatsAppConversations we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppConversationCountArgs>(
      args?: Subset<T, WhatsAppConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppConversationAggregateArgs>(args: Subset<T, WhatsAppConversationAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppConversationAggregateType<T>>

    /**
     * Group by WhatsAppConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppConversationGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppConversationGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppConversationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppConversation model
   */
  readonly fields: WhatsAppConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppConversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppConversation model
   */
  interface WhatsAppConversationFieldRefs {
    readonly id: FieldRef<"WhatsAppConversation", 'String'>
    readonly wacId: FieldRef<"WhatsAppConversation", 'String'>
    readonly recipientMobile: FieldRef<"WhatsAppConversation", 'String'>
    readonly category: FieldRef<"WhatsAppConversation", 'String'>
    readonly isFreeTier: FieldRef<"WhatsAppConversation", 'Boolean'>
    readonly openedAt: FieldRef<"WhatsAppConversation", 'DateTime'>
    readonly expiresAt: FieldRef<"WhatsAppConversation", 'DateTime'>
    readonly cost: FieldRef<"WhatsAppConversation", 'Float'>
    readonly createdAt: FieldRef<"WhatsAppConversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppConversation findUnique
   */
  export type WhatsAppConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConversation to fetch.
     */
    where: WhatsAppConversationWhereUniqueInput
  }

  /**
   * WhatsAppConversation findUniqueOrThrow
   */
  export type WhatsAppConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConversation to fetch.
     */
    where: WhatsAppConversationWhereUniqueInput
  }

  /**
   * WhatsAppConversation findFirst
   */
  export type WhatsAppConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConversation to fetch.
     */
    where?: WhatsAppConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConversations to fetch.
     */
    orderBy?: WhatsAppConversationOrderByWithRelationInput | WhatsAppConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppConversations.
     */
    cursor?: WhatsAppConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConversations.
     */
    distinct?: WhatsAppConversationScalarFieldEnum | WhatsAppConversationScalarFieldEnum[]
  }

  /**
   * WhatsAppConversation findFirstOrThrow
   */
  export type WhatsAppConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConversation to fetch.
     */
    where?: WhatsAppConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConversations to fetch.
     */
    orderBy?: WhatsAppConversationOrderByWithRelationInput | WhatsAppConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppConversations.
     */
    cursor?: WhatsAppConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConversations.
     */
    distinct?: WhatsAppConversationScalarFieldEnum | WhatsAppConversationScalarFieldEnum[]
  }

  /**
   * WhatsAppConversation findMany
   */
  export type WhatsAppConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppConversations to fetch.
     */
    where?: WhatsAppConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppConversations to fetch.
     */
    orderBy?: WhatsAppConversationOrderByWithRelationInput | WhatsAppConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppConversations.
     */
    cursor?: WhatsAppConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppConversations.
     */
    distinct?: WhatsAppConversationScalarFieldEnum | WhatsAppConversationScalarFieldEnum[]
  }

  /**
   * WhatsAppConversation create
   */
  export type WhatsAppConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppConversation.
     */
    data: XOR<WhatsAppConversationCreateInput, WhatsAppConversationUncheckedCreateInput>
  }

  /**
   * WhatsAppConversation createMany
   */
  export type WhatsAppConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppConversations.
     */
    data: WhatsAppConversationCreateManyInput | WhatsAppConversationCreateManyInput[]
  }

  /**
   * WhatsAppConversation createManyAndReturn
   */
  export type WhatsAppConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppConversations.
     */
    data: WhatsAppConversationCreateManyInput | WhatsAppConversationCreateManyInput[]
  }

  /**
   * WhatsAppConversation update
   */
  export type WhatsAppConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppConversation.
     */
    data: XOR<WhatsAppConversationUpdateInput, WhatsAppConversationUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppConversation to update.
     */
    where: WhatsAppConversationWhereUniqueInput
  }

  /**
   * WhatsAppConversation updateMany
   */
  export type WhatsAppConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppConversations.
     */
    data: XOR<WhatsAppConversationUpdateManyMutationInput, WhatsAppConversationUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppConversations to update
     */
    where?: WhatsAppConversationWhereInput
    /**
     * Limit how many WhatsAppConversations to update.
     */
    limit?: number
  }

  /**
   * WhatsAppConversation updateManyAndReturn
   */
  export type WhatsAppConversationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppConversations.
     */
    data: XOR<WhatsAppConversationUpdateManyMutationInput, WhatsAppConversationUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppConversations to update
     */
    where?: WhatsAppConversationWhereInput
    /**
     * Limit how many WhatsAppConversations to update.
     */
    limit?: number
  }

  /**
   * WhatsAppConversation upsert
   */
  export type WhatsAppConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppConversation to update in case it exists.
     */
    where: WhatsAppConversationWhereUniqueInput
    /**
     * In case the WhatsAppConversation found by the `where` argument doesn't exist, create a new WhatsAppConversation with this data.
     */
    create: XOR<WhatsAppConversationCreateInput, WhatsAppConversationUncheckedCreateInput>
    /**
     * In case the WhatsAppConversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppConversationUpdateInput, WhatsAppConversationUncheckedUpdateInput>
  }

  /**
   * WhatsAppConversation delete
   */
  export type WhatsAppConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppConversation to delete.
     */
    where: WhatsAppConversationWhereUniqueInput
  }

  /**
   * WhatsAppConversation deleteMany
   */
  export type WhatsAppConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppConversations to delete
     */
    where?: WhatsAppConversationWhereInput
    /**
     * Limit how many WhatsAppConversations to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppConversation without action
   */
  export type WhatsAppConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppConversation
     */
    select?: WhatsAppConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppConversation
     */
    omit?: WhatsAppConversationOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppAccountMetric
   */

  export type AggregateWhatsAppAccountMetric = {
    _count: WhatsAppAccountMetricCountAggregateOutputType | null
    _min: WhatsAppAccountMetricMinAggregateOutputType | null
    _max: WhatsAppAccountMetricMaxAggregateOutputType | null
  }

  export type WhatsAppAccountMetricMinAggregateOutputType = {
    id: string | null
    phoneNumberId: string | null
    qualityRating: string | null
    messagingLimit: string | null
    updatedAt: Date | null
  }

  export type WhatsAppAccountMetricMaxAggregateOutputType = {
    id: string | null
    phoneNumberId: string | null
    qualityRating: string | null
    messagingLimit: string | null
    updatedAt: Date | null
  }

  export type WhatsAppAccountMetricCountAggregateOutputType = {
    id: number
    phoneNumberId: number
    qualityRating: number
    messagingLimit: number
    updatedAt: number
    _all: number
  }


  export type WhatsAppAccountMetricMinAggregateInputType = {
    id?: true
    phoneNumberId?: true
    qualityRating?: true
    messagingLimit?: true
    updatedAt?: true
  }

  export type WhatsAppAccountMetricMaxAggregateInputType = {
    id?: true
    phoneNumberId?: true
    qualityRating?: true
    messagingLimit?: true
    updatedAt?: true
  }

  export type WhatsAppAccountMetricCountAggregateInputType = {
    id?: true
    phoneNumberId?: true
    qualityRating?: true
    messagingLimit?: true
    updatedAt?: true
    _all?: true
  }

  export type WhatsAppAccountMetricAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppAccountMetric to aggregate.
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppAccountMetrics to fetch.
     */
    orderBy?: WhatsAppAccountMetricOrderByWithRelationInput | WhatsAppAccountMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppAccountMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppAccountMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppAccountMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppAccountMetrics
    **/
    _count?: true | WhatsAppAccountMetricCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppAccountMetricMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppAccountMetricMaxAggregateInputType
  }

  export type GetWhatsAppAccountMetricAggregateType<T extends WhatsAppAccountMetricAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppAccountMetric]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppAccountMetric[P]>
      : GetScalarType<T[P], AggregateWhatsAppAccountMetric[P]>
  }




  export type WhatsAppAccountMetricGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppAccountMetricWhereInput
    orderBy?: WhatsAppAccountMetricOrderByWithAggregationInput | WhatsAppAccountMetricOrderByWithAggregationInput[]
    by: WhatsAppAccountMetricScalarFieldEnum[] | WhatsAppAccountMetricScalarFieldEnum
    having?: WhatsAppAccountMetricScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppAccountMetricCountAggregateInputType | true
    _min?: WhatsAppAccountMetricMinAggregateInputType
    _max?: WhatsAppAccountMetricMaxAggregateInputType
  }

  export type WhatsAppAccountMetricGroupByOutputType = {
    id: string
    phoneNumberId: string | null
    qualityRating: string
    messagingLimit: string
    updatedAt: Date
    _count: WhatsAppAccountMetricCountAggregateOutputType | null
    _min: WhatsAppAccountMetricMinAggregateOutputType | null
    _max: WhatsAppAccountMetricMaxAggregateOutputType | null
  }

  type GetWhatsAppAccountMetricGroupByPayload<T extends WhatsAppAccountMetricGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppAccountMetricGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppAccountMetricGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppAccountMetricGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppAccountMetricGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppAccountMetricSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumberId?: boolean
    qualityRating?: boolean
    messagingLimit?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppAccountMetric"]>

  export type WhatsAppAccountMetricSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumberId?: boolean
    qualityRating?: boolean
    messagingLimit?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppAccountMetric"]>

  export type WhatsAppAccountMetricSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumberId?: boolean
    qualityRating?: boolean
    messagingLimit?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppAccountMetric"]>

  export type WhatsAppAccountMetricSelectScalar = {
    id?: boolean
    phoneNumberId?: boolean
    qualityRating?: boolean
    messagingLimit?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppAccountMetricOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phoneNumberId" | "qualityRating" | "messagingLimit" | "updatedAt", ExtArgs["result"]["whatsAppAccountMetric"]>

  export type $WhatsAppAccountMetricPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppAccountMetric"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phoneNumberId: string | null
      qualityRating: string
      messagingLimit: string
      updatedAt: Date
    }, ExtArgs["result"]["whatsAppAccountMetric"]>
    composites: {}
  }

  type WhatsAppAccountMetricGetPayload<S extends boolean | null | undefined | WhatsAppAccountMetricDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppAccountMetricPayload, S>

  type WhatsAppAccountMetricCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppAccountMetricFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppAccountMetricCountAggregateInputType | true
    }

  export interface WhatsAppAccountMetricDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppAccountMetric'], meta: { name: 'WhatsAppAccountMetric' } }
    /**
     * Find zero or one WhatsAppAccountMetric that matches the filter.
     * @param {WhatsAppAccountMetricFindUniqueArgs} args - Arguments to find a WhatsAppAccountMetric
     * @example
     * // Get one WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppAccountMetricFindUniqueArgs>(args: SelectSubset<T, WhatsAppAccountMetricFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppAccountMetric that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppAccountMetricFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppAccountMetric
     * @example
     * // Get one WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppAccountMetricFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppAccountMetricFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppAccountMetric that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricFindFirstArgs} args - Arguments to find a WhatsAppAccountMetric
     * @example
     * // Get one WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppAccountMetricFindFirstArgs>(args?: SelectSubset<T, WhatsAppAccountMetricFindFirstArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppAccountMetric that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricFindFirstOrThrowArgs} args - Arguments to find a WhatsAppAccountMetric
     * @example
     * // Get one WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppAccountMetricFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppAccountMetricFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppAccountMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppAccountMetrics
     * const whatsAppAccountMetrics = await prisma.whatsAppAccountMetric.findMany()
     * 
     * // Get first 10 WhatsAppAccountMetrics
     * const whatsAppAccountMetrics = await prisma.whatsAppAccountMetric.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppAccountMetricWithIdOnly = await prisma.whatsAppAccountMetric.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppAccountMetricFindManyArgs>(args?: SelectSubset<T, WhatsAppAccountMetricFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppAccountMetric.
     * @param {WhatsAppAccountMetricCreateArgs} args - Arguments to create a WhatsAppAccountMetric.
     * @example
     * // Create one WhatsAppAccountMetric
     * const WhatsAppAccountMetric = await prisma.whatsAppAccountMetric.create({
     *   data: {
     *     // ... data to create a WhatsAppAccountMetric
     *   }
     * })
     * 
     */
    create<T extends WhatsAppAccountMetricCreateArgs>(args: SelectSubset<T, WhatsAppAccountMetricCreateArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppAccountMetrics.
     * @param {WhatsAppAccountMetricCreateManyArgs} args - Arguments to create many WhatsAppAccountMetrics.
     * @example
     * // Create many WhatsAppAccountMetrics
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppAccountMetricCreateManyArgs>(args?: SelectSubset<T, WhatsAppAccountMetricCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppAccountMetrics and returns the data saved in the database.
     * @param {WhatsAppAccountMetricCreateManyAndReturnArgs} args - Arguments to create many WhatsAppAccountMetrics.
     * @example
     * // Create many WhatsAppAccountMetrics
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppAccountMetrics and only return the `id`
     * const whatsAppAccountMetricWithIdOnly = await prisma.whatsAppAccountMetric.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppAccountMetricCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppAccountMetricCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppAccountMetric.
     * @param {WhatsAppAccountMetricDeleteArgs} args - Arguments to delete one WhatsAppAccountMetric.
     * @example
     * // Delete one WhatsAppAccountMetric
     * const WhatsAppAccountMetric = await prisma.whatsAppAccountMetric.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppAccountMetric
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppAccountMetricDeleteArgs>(args: SelectSubset<T, WhatsAppAccountMetricDeleteArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppAccountMetric.
     * @param {WhatsAppAccountMetricUpdateArgs} args - Arguments to update one WhatsAppAccountMetric.
     * @example
     * // Update one WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppAccountMetricUpdateArgs>(args: SelectSubset<T, WhatsAppAccountMetricUpdateArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppAccountMetrics.
     * @param {WhatsAppAccountMetricDeleteManyArgs} args - Arguments to filter WhatsAppAccountMetrics to delete.
     * @example
     * // Delete a few WhatsAppAccountMetrics
     * const { count } = await prisma.whatsAppAccountMetric.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppAccountMetricDeleteManyArgs>(args?: SelectSubset<T, WhatsAppAccountMetricDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppAccountMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppAccountMetrics
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppAccountMetricUpdateManyArgs>(args: SelectSubset<T, WhatsAppAccountMetricUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppAccountMetrics and returns the data updated in the database.
     * @param {WhatsAppAccountMetricUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppAccountMetrics.
     * @example
     * // Update many WhatsAppAccountMetrics
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppAccountMetrics and only return the `id`
     * const whatsAppAccountMetricWithIdOnly = await prisma.whatsAppAccountMetric.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppAccountMetricUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppAccountMetricUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppAccountMetric.
     * @param {WhatsAppAccountMetricUpsertArgs} args - Arguments to update or create a WhatsAppAccountMetric.
     * @example
     * // Update or create a WhatsAppAccountMetric
     * const whatsAppAccountMetric = await prisma.whatsAppAccountMetric.upsert({
     *   create: {
     *     // ... data to create a WhatsAppAccountMetric
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppAccountMetric we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppAccountMetricUpsertArgs>(args: SelectSubset<T, WhatsAppAccountMetricUpsertArgs<ExtArgs>>): Prisma__WhatsAppAccountMetricClient<$Result.GetResult<Prisma.$WhatsAppAccountMetricPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppAccountMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricCountArgs} args - Arguments to filter WhatsAppAccountMetrics to count.
     * @example
     * // Count the number of WhatsAppAccountMetrics
     * const count = await prisma.whatsAppAccountMetric.count({
     *   where: {
     *     // ... the filter for the WhatsAppAccountMetrics we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppAccountMetricCountArgs>(
      args?: Subset<T, WhatsAppAccountMetricCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppAccountMetricCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppAccountMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppAccountMetricAggregateArgs>(args: Subset<T, WhatsAppAccountMetricAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppAccountMetricAggregateType<T>>

    /**
     * Group by WhatsAppAccountMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppAccountMetricGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppAccountMetricGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppAccountMetricGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppAccountMetricGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppAccountMetricGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppAccountMetricGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppAccountMetric model
   */
  readonly fields: WhatsAppAccountMetricFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppAccountMetric.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppAccountMetricClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppAccountMetric model
   */
  interface WhatsAppAccountMetricFieldRefs {
    readonly id: FieldRef<"WhatsAppAccountMetric", 'String'>
    readonly phoneNumberId: FieldRef<"WhatsAppAccountMetric", 'String'>
    readonly qualityRating: FieldRef<"WhatsAppAccountMetric", 'String'>
    readonly messagingLimit: FieldRef<"WhatsAppAccountMetric", 'String'>
    readonly updatedAt: FieldRef<"WhatsAppAccountMetric", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppAccountMetric findUnique
   */
  export type WhatsAppAccountMetricFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppAccountMetric to fetch.
     */
    where: WhatsAppAccountMetricWhereUniqueInput
  }

  /**
   * WhatsAppAccountMetric findUniqueOrThrow
   */
  export type WhatsAppAccountMetricFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppAccountMetric to fetch.
     */
    where: WhatsAppAccountMetricWhereUniqueInput
  }

  /**
   * WhatsAppAccountMetric findFirst
   */
  export type WhatsAppAccountMetricFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppAccountMetric to fetch.
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppAccountMetrics to fetch.
     */
    orderBy?: WhatsAppAccountMetricOrderByWithRelationInput | WhatsAppAccountMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppAccountMetrics.
     */
    cursor?: WhatsAppAccountMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppAccountMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppAccountMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppAccountMetrics.
     */
    distinct?: WhatsAppAccountMetricScalarFieldEnum | WhatsAppAccountMetricScalarFieldEnum[]
  }

  /**
   * WhatsAppAccountMetric findFirstOrThrow
   */
  export type WhatsAppAccountMetricFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppAccountMetric to fetch.
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppAccountMetrics to fetch.
     */
    orderBy?: WhatsAppAccountMetricOrderByWithRelationInput | WhatsAppAccountMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppAccountMetrics.
     */
    cursor?: WhatsAppAccountMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppAccountMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppAccountMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppAccountMetrics.
     */
    distinct?: WhatsAppAccountMetricScalarFieldEnum | WhatsAppAccountMetricScalarFieldEnum[]
  }

  /**
   * WhatsAppAccountMetric findMany
   */
  export type WhatsAppAccountMetricFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppAccountMetrics to fetch.
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppAccountMetrics to fetch.
     */
    orderBy?: WhatsAppAccountMetricOrderByWithRelationInput | WhatsAppAccountMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppAccountMetrics.
     */
    cursor?: WhatsAppAccountMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppAccountMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppAccountMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppAccountMetrics.
     */
    distinct?: WhatsAppAccountMetricScalarFieldEnum | WhatsAppAccountMetricScalarFieldEnum[]
  }

  /**
   * WhatsAppAccountMetric create
   */
  export type WhatsAppAccountMetricCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppAccountMetric.
     */
    data: XOR<WhatsAppAccountMetricCreateInput, WhatsAppAccountMetricUncheckedCreateInput>
  }

  /**
   * WhatsAppAccountMetric createMany
   */
  export type WhatsAppAccountMetricCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppAccountMetrics.
     */
    data: WhatsAppAccountMetricCreateManyInput | WhatsAppAccountMetricCreateManyInput[]
  }

  /**
   * WhatsAppAccountMetric createManyAndReturn
   */
  export type WhatsAppAccountMetricCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppAccountMetrics.
     */
    data: WhatsAppAccountMetricCreateManyInput | WhatsAppAccountMetricCreateManyInput[]
  }

  /**
   * WhatsAppAccountMetric update
   */
  export type WhatsAppAccountMetricUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppAccountMetric.
     */
    data: XOR<WhatsAppAccountMetricUpdateInput, WhatsAppAccountMetricUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppAccountMetric to update.
     */
    where: WhatsAppAccountMetricWhereUniqueInput
  }

  /**
   * WhatsAppAccountMetric updateMany
   */
  export type WhatsAppAccountMetricUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppAccountMetrics.
     */
    data: XOR<WhatsAppAccountMetricUpdateManyMutationInput, WhatsAppAccountMetricUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppAccountMetrics to update
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * Limit how many WhatsAppAccountMetrics to update.
     */
    limit?: number
  }

  /**
   * WhatsAppAccountMetric updateManyAndReturn
   */
  export type WhatsAppAccountMetricUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppAccountMetrics.
     */
    data: XOR<WhatsAppAccountMetricUpdateManyMutationInput, WhatsAppAccountMetricUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppAccountMetrics to update
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * Limit how many WhatsAppAccountMetrics to update.
     */
    limit?: number
  }

  /**
   * WhatsAppAccountMetric upsert
   */
  export type WhatsAppAccountMetricUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppAccountMetric to update in case it exists.
     */
    where: WhatsAppAccountMetricWhereUniqueInput
    /**
     * In case the WhatsAppAccountMetric found by the `where` argument doesn't exist, create a new WhatsAppAccountMetric with this data.
     */
    create: XOR<WhatsAppAccountMetricCreateInput, WhatsAppAccountMetricUncheckedCreateInput>
    /**
     * In case the WhatsAppAccountMetric was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppAccountMetricUpdateInput, WhatsAppAccountMetricUncheckedUpdateInput>
  }

  /**
   * WhatsAppAccountMetric delete
   */
  export type WhatsAppAccountMetricDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppAccountMetric to delete.
     */
    where: WhatsAppAccountMetricWhereUniqueInput
  }

  /**
   * WhatsAppAccountMetric deleteMany
   */
  export type WhatsAppAccountMetricDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppAccountMetrics to delete
     */
    where?: WhatsAppAccountMetricWhereInput
    /**
     * Limit how many WhatsAppAccountMetrics to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppAccountMetric without action
   */
  export type WhatsAppAccountMetricDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppAccountMetric
     */
    select?: WhatsAppAccountMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppAccountMetric
     */
    omit?: WhatsAppAccountMetricOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppTemplate
   */

  export type AggregateWhatsAppTemplate = {
    _count: WhatsAppTemplateCountAggregateOutputType | null
    _min: WhatsAppTemplateMinAggregateOutputType | null
    _max: WhatsAppTemplateMaxAggregateOutputType | null
  }

  export type WhatsAppTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    language: string | null
    status: string | null
    headerImageUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WhatsAppTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    language: string | null
    status: string | null
    headerImageUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WhatsAppTemplateCountAggregateOutputType = {
    id: number
    name: number
    category: number
    language: number
    status: number
    headerImageUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WhatsAppTemplateMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    language?: true
    status?: true
    headerImageUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WhatsAppTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    language?: true
    status?: true
    headerImageUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WhatsAppTemplateCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    language?: true
    status?: true
    headerImageUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WhatsAppTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppTemplate to aggregate.
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppTemplates to fetch.
     */
    orderBy?: WhatsAppTemplateOrderByWithRelationInput | WhatsAppTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppTemplates
    **/
    _count?: true | WhatsAppTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppTemplateMaxAggregateInputType
  }

  export type GetWhatsAppTemplateAggregateType<T extends WhatsAppTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppTemplate[P]>
      : GetScalarType<T[P], AggregateWhatsAppTemplate[P]>
  }




  export type WhatsAppTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppTemplateWhereInput
    orderBy?: WhatsAppTemplateOrderByWithAggregationInput | WhatsAppTemplateOrderByWithAggregationInput[]
    by: WhatsAppTemplateScalarFieldEnum[] | WhatsAppTemplateScalarFieldEnum
    having?: WhatsAppTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppTemplateCountAggregateInputType | true
    _min?: WhatsAppTemplateMinAggregateInputType
    _max?: WhatsAppTemplateMaxAggregateInputType
  }

  export type WhatsAppTemplateGroupByOutputType = {
    id: string
    name: string
    category: string
    language: string
    status: string
    headerImageUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: WhatsAppTemplateCountAggregateOutputType | null
    _min: WhatsAppTemplateMinAggregateOutputType | null
    _max: WhatsAppTemplateMaxAggregateOutputType | null
  }

  type GetWhatsAppTemplateGroupByPayload<T extends WhatsAppTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppTemplateGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    language?: boolean
    status?: boolean
    headerImageUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppTemplate"]>

  export type WhatsAppTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    language?: boolean
    status?: boolean
    headerImageUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppTemplate"]>

  export type WhatsAppTemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    language?: boolean
    status?: boolean
    headerImageUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppTemplate"]>

  export type WhatsAppTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    language?: boolean
    status?: boolean
    headerImageUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "category" | "language" | "status" | "headerImageUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["whatsAppTemplate"]>

  export type $WhatsAppTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: string
      language: string
      status: string
      headerImageUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["whatsAppTemplate"]>
    composites: {}
  }

  type WhatsAppTemplateGetPayload<S extends boolean | null | undefined | WhatsAppTemplateDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppTemplatePayload, S>

  type WhatsAppTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppTemplateCountAggregateInputType | true
    }

  export interface WhatsAppTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppTemplate'], meta: { name: 'WhatsAppTemplate' } }
    /**
     * Find zero or one WhatsAppTemplate that matches the filter.
     * @param {WhatsAppTemplateFindUniqueArgs} args - Arguments to find a WhatsAppTemplate
     * @example
     * // Get one WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppTemplateFindUniqueArgs>(args: SelectSubset<T, WhatsAppTemplateFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppTemplateFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppTemplate
     * @example
     * // Get one WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateFindFirstArgs} args - Arguments to find a WhatsAppTemplate
     * @example
     * // Get one WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppTemplateFindFirstArgs>(args?: SelectSubset<T, WhatsAppTemplateFindFirstArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateFindFirstOrThrowArgs} args - Arguments to find a WhatsAppTemplate
     * @example
     * // Get one WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppTemplates
     * const whatsAppTemplates = await prisma.whatsAppTemplate.findMany()
     * 
     * // Get first 10 WhatsAppTemplates
     * const whatsAppTemplates = await prisma.whatsAppTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppTemplateWithIdOnly = await prisma.whatsAppTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppTemplateFindManyArgs>(args?: SelectSubset<T, WhatsAppTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppTemplate.
     * @param {WhatsAppTemplateCreateArgs} args - Arguments to create a WhatsAppTemplate.
     * @example
     * // Create one WhatsAppTemplate
     * const WhatsAppTemplate = await prisma.whatsAppTemplate.create({
     *   data: {
     *     // ... data to create a WhatsAppTemplate
     *   }
     * })
     * 
     */
    create<T extends WhatsAppTemplateCreateArgs>(args: SelectSubset<T, WhatsAppTemplateCreateArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppTemplates.
     * @param {WhatsAppTemplateCreateManyArgs} args - Arguments to create many WhatsAppTemplates.
     * @example
     * // Create many WhatsAppTemplates
     * const whatsAppTemplate = await prisma.whatsAppTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppTemplateCreateManyArgs>(args?: SelectSubset<T, WhatsAppTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppTemplates and returns the data saved in the database.
     * @param {WhatsAppTemplateCreateManyAndReturnArgs} args - Arguments to create many WhatsAppTemplates.
     * @example
     * // Create many WhatsAppTemplates
     * const whatsAppTemplate = await prisma.whatsAppTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppTemplates and only return the `id`
     * const whatsAppTemplateWithIdOnly = await prisma.whatsAppTemplate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppTemplate.
     * @param {WhatsAppTemplateDeleteArgs} args - Arguments to delete one WhatsAppTemplate.
     * @example
     * // Delete one WhatsAppTemplate
     * const WhatsAppTemplate = await prisma.whatsAppTemplate.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppTemplate
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppTemplateDeleteArgs>(args: SelectSubset<T, WhatsAppTemplateDeleteArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppTemplate.
     * @param {WhatsAppTemplateUpdateArgs} args - Arguments to update one WhatsAppTemplate.
     * @example
     * // Update one WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppTemplateUpdateArgs>(args: SelectSubset<T, WhatsAppTemplateUpdateArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppTemplates.
     * @param {WhatsAppTemplateDeleteManyArgs} args - Arguments to filter WhatsAppTemplates to delete.
     * @example
     * // Delete a few WhatsAppTemplates
     * const { count } = await prisma.whatsAppTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppTemplateDeleteManyArgs>(args?: SelectSubset<T, WhatsAppTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppTemplates
     * const whatsAppTemplate = await prisma.whatsAppTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppTemplateUpdateManyArgs>(args: SelectSubset<T, WhatsAppTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppTemplates and returns the data updated in the database.
     * @param {WhatsAppTemplateUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppTemplates.
     * @example
     * // Update many WhatsAppTemplates
     * const whatsAppTemplate = await prisma.whatsAppTemplate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppTemplates and only return the `id`
     * const whatsAppTemplateWithIdOnly = await prisma.whatsAppTemplate.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppTemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppTemplate.
     * @param {WhatsAppTemplateUpsertArgs} args - Arguments to update or create a WhatsAppTemplate.
     * @example
     * // Update or create a WhatsAppTemplate
     * const whatsAppTemplate = await prisma.whatsAppTemplate.upsert({
     *   create: {
     *     // ... data to create a WhatsAppTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppTemplate we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppTemplateUpsertArgs>(args: SelectSubset<T, WhatsAppTemplateUpsertArgs<ExtArgs>>): Prisma__WhatsAppTemplateClient<$Result.GetResult<Prisma.$WhatsAppTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateCountArgs} args - Arguments to filter WhatsAppTemplates to count.
     * @example
     * // Count the number of WhatsAppTemplates
     * const count = await prisma.whatsAppTemplate.count({
     *   where: {
     *     // ... the filter for the WhatsAppTemplates we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppTemplateCountArgs>(
      args?: Subset<T, WhatsAppTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppTemplateAggregateArgs>(args: Subset<T, WhatsAppTemplateAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppTemplateAggregateType<T>>

    /**
     * Group by WhatsAppTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppTemplateGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppTemplateGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppTemplateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppTemplate model
   */
  readonly fields: WhatsAppTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppTemplate model
   */
  interface WhatsAppTemplateFieldRefs {
    readonly id: FieldRef<"WhatsAppTemplate", 'String'>
    readonly name: FieldRef<"WhatsAppTemplate", 'String'>
    readonly category: FieldRef<"WhatsAppTemplate", 'String'>
    readonly language: FieldRef<"WhatsAppTemplate", 'String'>
    readonly status: FieldRef<"WhatsAppTemplate", 'String'>
    readonly headerImageUrl: FieldRef<"WhatsAppTemplate", 'String'>
    readonly createdAt: FieldRef<"WhatsAppTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"WhatsAppTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppTemplate findUnique
   */
  export type WhatsAppTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppTemplate to fetch.
     */
    where: WhatsAppTemplateWhereUniqueInput
  }

  /**
   * WhatsAppTemplate findUniqueOrThrow
   */
  export type WhatsAppTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppTemplate to fetch.
     */
    where: WhatsAppTemplateWhereUniqueInput
  }

  /**
   * WhatsAppTemplate findFirst
   */
  export type WhatsAppTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppTemplate to fetch.
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppTemplates to fetch.
     */
    orderBy?: WhatsAppTemplateOrderByWithRelationInput | WhatsAppTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppTemplates.
     */
    cursor?: WhatsAppTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppTemplates.
     */
    distinct?: WhatsAppTemplateScalarFieldEnum | WhatsAppTemplateScalarFieldEnum[]
  }

  /**
   * WhatsAppTemplate findFirstOrThrow
   */
  export type WhatsAppTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppTemplate to fetch.
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppTemplates to fetch.
     */
    orderBy?: WhatsAppTemplateOrderByWithRelationInput | WhatsAppTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppTemplates.
     */
    cursor?: WhatsAppTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppTemplates.
     */
    distinct?: WhatsAppTemplateScalarFieldEnum | WhatsAppTemplateScalarFieldEnum[]
  }

  /**
   * WhatsAppTemplate findMany
   */
  export type WhatsAppTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppTemplates to fetch.
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppTemplates to fetch.
     */
    orderBy?: WhatsAppTemplateOrderByWithRelationInput | WhatsAppTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppTemplates.
     */
    cursor?: WhatsAppTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppTemplates.
     */
    distinct?: WhatsAppTemplateScalarFieldEnum | WhatsAppTemplateScalarFieldEnum[]
  }

  /**
   * WhatsAppTemplate create
   */
  export type WhatsAppTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppTemplate.
     */
    data: XOR<WhatsAppTemplateCreateInput, WhatsAppTemplateUncheckedCreateInput>
  }

  /**
   * WhatsAppTemplate createMany
   */
  export type WhatsAppTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppTemplates.
     */
    data: WhatsAppTemplateCreateManyInput | WhatsAppTemplateCreateManyInput[]
  }

  /**
   * WhatsAppTemplate createManyAndReturn
   */
  export type WhatsAppTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppTemplates.
     */
    data: WhatsAppTemplateCreateManyInput | WhatsAppTemplateCreateManyInput[]
  }

  /**
   * WhatsAppTemplate update
   */
  export type WhatsAppTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppTemplate.
     */
    data: XOR<WhatsAppTemplateUpdateInput, WhatsAppTemplateUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppTemplate to update.
     */
    where: WhatsAppTemplateWhereUniqueInput
  }

  /**
   * WhatsAppTemplate updateMany
   */
  export type WhatsAppTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppTemplates.
     */
    data: XOR<WhatsAppTemplateUpdateManyMutationInput, WhatsAppTemplateUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppTemplates to update
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * Limit how many WhatsAppTemplates to update.
     */
    limit?: number
  }

  /**
   * WhatsAppTemplate updateManyAndReturn
   */
  export type WhatsAppTemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppTemplates.
     */
    data: XOR<WhatsAppTemplateUpdateManyMutationInput, WhatsAppTemplateUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppTemplates to update
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * Limit how many WhatsAppTemplates to update.
     */
    limit?: number
  }

  /**
   * WhatsAppTemplate upsert
   */
  export type WhatsAppTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppTemplate to update in case it exists.
     */
    where: WhatsAppTemplateWhereUniqueInput
    /**
     * In case the WhatsAppTemplate found by the `where` argument doesn't exist, create a new WhatsAppTemplate with this data.
     */
    create: XOR<WhatsAppTemplateCreateInput, WhatsAppTemplateUncheckedCreateInput>
    /**
     * In case the WhatsAppTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppTemplateUpdateInput, WhatsAppTemplateUncheckedUpdateInput>
  }

  /**
   * WhatsAppTemplate delete
   */
  export type WhatsAppTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppTemplate to delete.
     */
    where: WhatsAppTemplateWhereUniqueInput
  }

  /**
   * WhatsAppTemplate deleteMany
   */
  export type WhatsAppTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppTemplates to delete
     */
    where?: WhatsAppTemplateWhereInput
    /**
     * Limit how many WhatsAppTemplates to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppTemplate without action
   */
  export type WhatsAppTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppTemplate
     */
    select?: WhatsAppTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppTemplate
     */
    omit?: WhatsAppTemplateOmit<ExtArgs> | null
  }


  /**
   * Model WhatsAppEventTrigger
   */

  export type AggregateWhatsAppEventTrigger = {
    _count: WhatsAppEventTriggerCountAggregateOutputType | null
    _min: WhatsAppEventTriggerMinAggregateOutputType | null
    _max: WhatsAppEventTriggerMaxAggregateOutputType | null
  }

  export type WhatsAppEventTriggerMinAggregateOutputType = {
    id: string | null
    eventName: string | null
    templateName: string | null
    isActive: boolean | null
    variableMap: string | null
    updatedAt: Date | null
  }

  export type WhatsAppEventTriggerMaxAggregateOutputType = {
    id: string | null
    eventName: string | null
    templateName: string | null
    isActive: boolean | null
    variableMap: string | null
    updatedAt: Date | null
  }

  export type WhatsAppEventTriggerCountAggregateOutputType = {
    id: number
    eventName: number
    templateName: number
    isActive: number
    variableMap: number
    updatedAt: number
    _all: number
  }


  export type WhatsAppEventTriggerMinAggregateInputType = {
    id?: true
    eventName?: true
    templateName?: true
    isActive?: true
    variableMap?: true
    updatedAt?: true
  }

  export type WhatsAppEventTriggerMaxAggregateInputType = {
    id?: true
    eventName?: true
    templateName?: true
    isActive?: true
    variableMap?: true
    updatedAt?: true
  }

  export type WhatsAppEventTriggerCountAggregateInputType = {
    id?: true
    eventName?: true
    templateName?: true
    isActive?: true
    variableMap?: true
    updatedAt?: true
    _all?: true
  }

  export type WhatsAppEventTriggerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppEventTrigger to aggregate.
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppEventTriggers to fetch.
     */
    orderBy?: WhatsAppEventTriggerOrderByWithRelationInput | WhatsAppEventTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WhatsAppEventTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppEventTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppEventTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WhatsAppEventTriggers
    **/
    _count?: true | WhatsAppEventTriggerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WhatsAppEventTriggerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WhatsAppEventTriggerMaxAggregateInputType
  }

  export type GetWhatsAppEventTriggerAggregateType<T extends WhatsAppEventTriggerAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsAppEventTrigger]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsAppEventTrigger[P]>
      : GetScalarType<T[P], AggregateWhatsAppEventTrigger[P]>
  }




  export type WhatsAppEventTriggerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WhatsAppEventTriggerWhereInput
    orderBy?: WhatsAppEventTriggerOrderByWithAggregationInput | WhatsAppEventTriggerOrderByWithAggregationInput[]
    by: WhatsAppEventTriggerScalarFieldEnum[] | WhatsAppEventTriggerScalarFieldEnum
    having?: WhatsAppEventTriggerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WhatsAppEventTriggerCountAggregateInputType | true
    _min?: WhatsAppEventTriggerMinAggregateInputType
    _max?: WhatsAppEventTriggerMaxAggregateInputType
  }

  export type WhatsAppEventTriggerGroupByOutputType = {
    id: string
    eventName: string
    templateName: string | null
    isActive: boolean
    variableMap: string | null
    updatedAt: Date
    _count: WhatsAppEventTriggerCountAggregateOutputType | null
    _min: WhatsAppEventTriggerMinAggregateOutputType | null
    _max: WhatsAppEventTriggerMaxAggregateOutputType | null
  }

  type GetWhatsAppEventTriggerGroupByPayload<T extends WhatsAppEventTriggerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WhatsAppEventTriggerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WhatsAppEventTriggerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WhatsAppEventTriggerGroupByOutputType[P]>
            : GetScalarType<T[P], WhatsAppEventTriggerGroupByOutputType[P]>
        }
      >
    >


  export type WhatsAppEventTriggerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventName?: boolean
    templateName?: boolean
    isActive?: boolean
    variableMap?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppEventTrigger"]>

  export type WhatsAppEventTriggerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventName?: boolean
    templateName?: boolean
    isActive?: boolean
    variableMap?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppEventTrigger"]>

  export type WhatsAppEventTriggerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventName?: boolean
    templateName?: boolean
    isActive?: boolean
    variableMap?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["whatsAppEventTrigger"]>

  export type WhatsAppEventTriggerSelectScalar = {
    id?: boolean
    eventName?: boolean
    templateName?: boolean
    isActive?: boolean
    variableMap?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppEventTriggerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventName" | "templateName" | "isActive" | "variableMap" | "updatedAt", ExtArgs["result"]["whatsAppEventTrigger"]>

  export type $WhatsAppEventTriggerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WhatsAppEventTrigger"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventName: string
      templateName: string | null
      isActive: boolean
      variableMap: string | null
      updatedAt: Date
    }, ExtArgs["result"]["whatsAppEventTrigger"]>
    composites: {}
  }

  type WhatsAppEventTriggerGetPayload<S extends boolean | null | undefined | WhatsAppEventTriggerDefaultArgs> = $Result.GetResult<Prisma.$WhatsAppEventTriggerPayload, S>

  type WhatsAppEventTriggerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WhatsAppEventTriggerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WhatsAppEventTriggerCountAggregateInputType | true
    }

  export interface WhatsAppEventTriggerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WhatsAppEventTrigger'], meta: { name: 'WhatsAppEventTrigger' } }
    /**
     * Find zero or one WhatsAppEventTrigger that matches the filter.
     * @param {WhatsAppEventTriggerFindUniqueArgs} args - Arguments to find a WhatsAppEventTrigger
     * @example
     * // Get one WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WhatsAppEventTriggerFindUniqueArgs>(args: SelectSubset<T, WhatsAppEventTriggerFindUniqueArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WhatsAppEventTrigger that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WhatsAppEventTriggerFindUniqueOrThrowArgs} args - Arguments to find a WhatsAppEventTrigger
     * @example
     * // Get one WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WhatsAppEventTriggerFindUniqueOrThrowArgs>(args: SelectSubset<T, WhatsAppEventTriggerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppEventTrigger that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerFindFirstArgs} args - Arguments to find a WhatsAppEventTrigger
     * @example
     * // Get one WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WhatsAppEventTriggerFindFirstArgs>(args?: SelectSubset<T, WhatsAppEventTriggerFindFirstArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WhatsAppEventTrigger that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerFindFirstOrThrowArgs} args - Arguments to find a WhatsAppEventTrigger
     * @example
     * // Get one WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WhatsAppEventTriggerFindFirstOrThrowArgs>(args?: SelectSubset<T, WhatsAppEventTriggerFindFirstOrThrowArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WhatsAppEventTriggers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WhatsAppEventTriggers
     * const whatsAppEventTriggers = await prisma.whatsAppEventTrigger.findMany()
     * 
     * // Get first 10 WhatsAppEventTriggers
     * const whatsAppEventTriggers = await prisma.whatsAppEventTrigger.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsAppEventTriggerWithIdOnly = await prisma.whatsAppEventTrigger.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WhatsAppEventTriggerFindManyArgs>(args?: SelectSubset<T, WhatsAppEventTriggerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WhatsAppEventTrigger.
     * @param {WhatsAppEventTriggerCreateArgs} args - Arguments to create a WhatsAppEventTrigger.
     * @example
     * // Create one WhatsAppEventTrigger
     * const WhatsAppEventTrigger = await prisma.whatsAppEventTrigger.create({
     *   data: {
     *     // ... data to create a WhatsAppEventTrigger
     *   }
     * })
     * 
     */
    create<T extends WhatsAppEventTriggerCreateArgs>(args: SelectSubset<T, WhatsAppEventTriggerCreateArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WhatsAppEventTriggers.
     * @param {WhatsAppEventTriggerCreateManyArgs} args - Arguments to create many WhatsAppEventTriggers.
     * @example
     * // Create many WhatsAppEventTriggers
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WhatsAppEventTriggerCreateManyArgs>(args?: SelectSubset<T, WhatsAppEventTriggerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WhatsAppEventTriggers and returns the data saved in the database.
     * @param {WhatsAppEventTriggerCreateManyAndReturnArgs} args - Arguments to create many WhatsAppEventTriggers.
     * @example
     * // Create many WhatsAppEventTriggers
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WhatsAppEventTriggers and only return the `id`
     * const whatsAppEventTriggerWithIdOnly = await prisma.whatsAppEventTrigger.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WhatsAppEventTriggerCreateManyAndReturnArgs>(args?: SelectSubset<T, WhatsAppEventTriggerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WhatsAppEventTrigger.
     * @param {WhatsAppEventTriggerDeleteArgs} args - Arguments to delete one WhatsAppEventTrigger.
     * @example
     * // Delete one WhatsAppEventTrigger
     * const WhatsAppEventTrigger = await prisma.whatsAppEventTrigger.delete({
     *   where: {
     *     // ... filter to delete one WhatsAppEventTrigger
     *   }
     * })
     * 
     */
    delete<T extends WhatsAppEventTriggerDeleteArgs>(args: SelectSubset<T, WhatsAppEventTriggerDeleteArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WhatsAppEventTrigger.
     * @param {WhatsAppEventTriggerUpdateArgs} args - Arguments to update one WhatsAppEventTrigger.
     * @example
     * // Update one WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WhatsAppEventTriggerUpdateArgs>(args: SelectSubset<T, WhatsAppEventTriggerUpdateArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WhatsAppEventTriggers.
     * @param {WhatsAppEventTriggerDeleteManyArgs} args - Arguments to filter WhatsAppEventTriggers to delete.
     * @example
     * // Delete a few WhatsAppEventTriggers
     * const { count } = await prisma.whatsAppEventTrigger.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WhatsAppEventTriggerDeleteManyArgs>(args?: SelectSubset<T, WhatsAppEventTriggerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppEventTriggers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WhatsAppEventTriggers
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WhatsAppEventTriggerUpdateManyArgs>(args: SelectSubset<T, WhatsAppEventTriggerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WhatsAppEventTriggers and returns the data updated in the database.
     * @param {WhatsAppEventTriggerUpdateManyAndReturnArgs} args - Arguments to update many WhatsAppEventTriggers.
     * @example
     * // Update many WhatsAppEventTriggers
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WhatsAppEventTriggers and only return the `id`
     * const whatsAppEventTriggerWithIdOnly = await prisma.whatsAppEventTrigger.updateManyAndReturn({
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
    updateManyAndReturn<T extends WhatsAppEventTriggerUpdateManyAndReturnArgs>(args: SelectSubset<T, WhatsAppEventTriggerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WhatsAppEventTrigger.
     * @param {WhatsAppEventTriggerUpsertArgs} args - Arguments to update or create a WhatsAppEventTrigger.
     * @example
     * // Update or create a WhatsAppEventTrigger
     * const whatsAppEventTrigger = await prisma.whatsAppEventTrigger.upsert({
     *   create: {
     *     // ... data to create a WhatsAppEventTrigger
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WhatsAppEventTrigger we want to update
     *   }
     * })
     */
    upsert<T extends WhatsAppEventTriggerUpsertArgs>(args: SelectSubset<T, WhatsAppEventTriggerUpsertArgs<ExtArgs>>): Prisma__WhatsAppEventTriggerClient<$Result.GetResult<Prisma.$WhatsAppEventTriggerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WhatsAppEventTriggers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerCountArgs} args - Arguments to filter WhatsAppEventTriggers to count.
     * @example
     * // Count the number of WhatsAppEventTriggers
     * const count = await prisma.whatsAppEventTrigger.count({
     *   where: {
     *     // ... the filter for the WhatsAppEventTriggers we want to count
     *   }
     * })
    **/
    count<T extends WhatsAppEventTriggerCountArgs>(
      args?: Subset<T, WhatsAppEventTriggerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WhatsAppEventTriggerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WhatsAppEventTrigger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WhatsAppEventTriggerAggregateArgs>(args: Subset<T, WhatsAppEventTriggerAggregateArgs>): Prisma.PrismaPromise<GetWhatsAppEventTriggerAggregateType<T>>

    /**
     * Group by WhatsAppEventTrigger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WhatsAppEventTriggerGroupByArgs} args - Group by arguments.
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
      T extends WhatsAppEventTriggerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WhatsAppEventTriggerGroupByArgs['orderBy'] }
        : { orderBy?: WhatsAppEventTriggerGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WhatsAppEventTriggerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsAppEventTriggerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WhatsAppEventTrigger model
   */
  readonly fields: WhatsAppEventTriggerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WhatsAppEventTrigger.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WhatsAppEventTriggerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WhatsAppEventTrigger model
   */
  interface WhatsAppEventTriggerFieldRefs {
    readonly id: FieldRef<"WhatsAppEventTrigger", 'String'>
    readonly eventName: FieldRef<"WhatsAppEventTrigger", 'String'>
    readonly templateName: FieldRef<"WhatsAppEventTrigger", 'String'>
    readonly isActive: FieldRef<"WhatsAppEventTrigger", 'Boolean'>
    readonly variableMap: FieldRef<"WhatsAppEventTrigger", 'String'>
    readonly updatedAt: FieldRef<"WhatsAppEventTrigger", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WhatsAppEventTrigger findUnique
   */
  export type WhatsAppEventTriggerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppEventTrigger to fetch.
     */
    where: WhatsAppEventTriggerWhereUniqueInput
  }

  /**
   * WhatsAppEventTrigger findUniqueOrThrow
   */
  export type WhatsAppEventTriggerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppEventTrigger to fetch.
     */
    where: WhatsAppEventTriggerWhereUniqueInput
  }

  /**
   * WhatsAppEventTrigger findFirst
   */
  export type WhatsAppEventTriggerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppEventTrigger to fetch.
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppEventTriggers to fetch.
     */
    orderBy?: WhatsAppEventTriggerOrderByWithRelationInput | WhatsAppEventTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppEventTriggers.
     */
    cursor?: WhatsAppEventTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppEventTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppEventTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppEventTriggers.
     */
    distinct?: WhatsAppEventTriggerScalarFieldEnum | WhatsAppEventTriggerScalarFieldEnum[]
  }

  /**
   * WhatsAppEventTrigger findFirstOrThrow
   */
  export type WhatsAppEventTriggerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppEventTrigger to fetch.
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppEventTriggers to fetch.
     */
    orderBy?: WhatsAppEventTriggerOrderByWithRelationInput | WhatsAppEventTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WhatsAppEventTriggers.
     */
    cursor?: WhatsAppEventTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppEventTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppEventTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppEventTriggers.
     */
    distinct?: WhatsAppEventTriggerScalarFieldEnum | WhatsAppEventTriggerScalarFieldEnum[]
  }

  /**
   * WhatsAppEventTrigger findMany
   */
  export type WhatsAppEventTriggerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter, which WhatsAppEventTriggers to fetch.
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WhatsAppEventTriggers to fetch.
     */
    orderBy?: WhatsAppEventTriggerOrderByWithRelationInput | WhatsAppEventTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WhatsAppEventTriggers.
     */
    cursor?: WhatsAppEventTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WhatsAppEventTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WhatsAppEventTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WhatsAppEventTriggers.
     */
    distinct?: WhatsAppEventTriggerScalarFieldEnum | WhatsAppEventTriggerScalarFieldEnum[]
  }

  /**
   * WhatsAppEventTrigger create
   */
  export type WhatsAppEventTriggerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * The data needed to create a WhatsAppEventTrigger.
     */
    data: XOR<WhatsAppEventTriggerCreateInput, WhatsAppEventTriggerUncheckedCreateInput>
  }

  /**
   * WhatsAppEventTrigger createMany
   */
  export type WhatsAppEventTriggerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WhatsAppEventTriggers.
     */
    data: WhatsAppEventTriggerCreateManyInput | WhatsAppEventTriggerCreateManyInput[]
  }

  /**
   * WhatsAppEventTrigger createManyAndReturn
   */
  export type WhatsAppEventTriggerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * The data used to create many WhatsAppEventTriggers.
     */
    data: WhatsAppEventTriggerCreateManyInput | WhatsAppEventTriggerCreateManyInput[]
  }

  /**
   * WhatsAppEventTrigger update
   */
  export type WhatsAppEventTriggerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * The data needed to update a WhatsAppEventTrigger.
     */
    data: XOR<WhatsAppEventTriggerUpdateInput, WhatsAppEventTriggerUncheckedUpdateInput>
    /**
     * Choose, which WhatsAppEventTrigger to update.
     */
    where: WhatsAppEventTriggerWhereUniqueInput
  }

  /**
   * WhatsAppEventTrigger updateMany
   */
  export type WhatsAppEventTriggerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WhatsAppEventTriggers.
     */
    data: XOR<WhatsAppEventTriggerUpdateManyMutationInput, WhatsAppEventTriggerUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppEventTriggers to update
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * Limit how many WhatsAppEventTriggers to update.
     */
    limit?: number
  }

  /**
   * WhatsAppEventTrigger updateManyAndReturn
   */
  export type WhatsAppEventTriggerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * The data used to update WhatsAppEventTriggers.
     */
    data: XOR<WhatsAppEventTriggerUpdateManyMutationInput, WhatsAppEventTriggerUncheckedUpdateManyInput>
    /**
     * Filter which WhatsAppEventTriggers to update
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * Limit how many WhatsAppEventTriggers to update.
     */
    limit?: number
  }

  /**
   * WhatsAppEventTrigger upsert
   */
  export type WhatsAppEventTriggerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * The filter to search for the WhatsAppEventTrigger to update in case it exists.
     */
    where: WhatsAppEventTriggerWhereUniqueInput
    /**
     * In case the WhatsAppEventTrigger found by the `where` argument doesn't exist, create a new WhatsAppEventTrigger with this data.
     */
    create: XOR<WhatsAppEventTriggerCreateInput, WhatsAppEventTriggerUncheckedCreateInput>
    /**
     * In case the WhatsAppEventTrigger was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WhatsAppEventTriggerUpdateInput, WhatsAppEventTriggerUncheckedUpdateInput>
  }

  /**
   * WhatsAppEventTrigger delete
   */
  export type WhatsAppEventTriggerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
    /**
     * Filter which WhatsAppEventTrigger to delete.
     */
    where: WhatsAppEventTriggerWhereUniqueInput
  }

  /**
   * WhatsAppEventTrigger deleteMany
   */
  export type WhatsAppEventTriggerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WhatsAppEventTriggers to delete
     */
    where?: WhatsAppEventTriggerWhereInput
    /**
     * Limit how many WhatsAppEventTriggers to delete.
     */
    limit?: number
  }

  /**
   * WhatsAppEventTrigger without action
   */
  export type WhatsAppEventTriggerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WhatsAppEventTrigger
     */
    select?: WhatsAppEventTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WhatsAppEventTrigger
     */
    omit?: WhatsAppEventTriggerOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WhatsAppMessageScalarFieldEnum: {
    id: 'id',
    wamid: 'wamid',
    phoneNumber: 'phoneNumber',
    direction: 'direction',
    type: 'type',
    content: 'content',
    status: 'status',
    errorCode: 'errorCode',
    errorMessage: 'errorMessage',
    metadata: 'metadata',
    isOptOut: 'isOptOut',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WhatsAppMessageScalarFieldEnum = (typeof WhatsAppMessageScalarFieldEnum)[keyof typeof WhatsAppMessageScalarFieldEnum]


  export const WhatsAppOtpScalarFieldEnum: {
    id: 'id',
    phoneNumber: 'phoneNumber',
    otp: 'otp',
    purpose: 'purpose',
    verified: 'verified',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type WhatsAppOtpScalarFieldEnum = (typeof WhatsAppOtpScalarFieldEnum)[keyof typeof WhatsAppOtpScalarFieldEnum]


  export const WhatsAppWebhookLogScalarFieldEnum: {
    id: 'id',
    event: 'event',
    payload: 'payload',
    processed: 'processed',
    createdAt: 'createdAt'
  };

  export type WhatsAppWebhookLogScalarFieldEnum = (typeof WhatsAppWebhookLogScalarFieldEnum)[keyof typeof WhatsAppWebhookLogScalarFieldEnum]


  export const WhatsAppConfigScalarFieldEnum: {
    key: 'key',
    value: 'value',
    updatedAt: 'updatedAt'
  };

  export type WhatsAppConfigScalarFieldEnum = (typeof WhatsAppConfigScalarFieldEnum)[keyof typeof WhatsAppConfigScalarFieldEnum]


  export const WhatsAppConversationScalarFieldEnum: {
    id: 'id',
    wacId: 'wacId',
    recipientMobile: 'recipientMobile',
    category: 'category',
    isFreeTier: 'isFreeTier',
    openedAt: 'openedAt',
    expiresAt: 'expiresAt',
    cost: 'cost',
    createdAt: 'createdAt'
  };

  export type WhatsAppConversationScalarFieldEnum = (typeof WhatsAppConversationScalarFieldEnum)[keyof typeof WhatsAppConversationScalarFieldEnum]


  export const WhatsAppAccountMetricScalarFieldEnum: {
    id: 'id',
    phoneNumberId: 'phoneNumberId',
    qualityRating: 'qualityRating',
    messagingLimit: 'messagingLimit',
    updatedAt: 'updatedAt'
  };

  export type WhatsAppAccountMetricScalarFieldEnum = (typeof WhatsAppAccountMetricScalarFieldEnum)[keyof typeof WhatsAppAccountMetricScalarFieldEnum]


  export const WhatsAppTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    language: 'language',
    status: 'status',
    headerImageUrl: 'headerImageUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WhatsAppTemplateScalarFieldEnum = (typeof WhatsAppTemplateScalarFieldEnum)[keyof typeof WhatsAppTemplateScalarFieldEnum]


  export const WhatsAppEventTriggerScalarFieldEnum: {
    id: 'id',
    eventName: 'eventName',
    templateName: 'templateName',
    isActive: 'isActive',
    variableMap: 'variableMap',
    updatedAt: 'updatedAt'
  };

  export type WhatsAppEventTriggerScalarFieldEnum = (typeof WhatsAppEventTriggerScalarFieldEnum)[keyof typeof WhatsAppEventTriggerScalarFieldEnum]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type WhatsAppMessageWhereInput = {
    AND?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    OR?: WhatsAppMessageWhereInput[]
    NOT?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    id?: StringFilter<"WhatsAppMessage"> | string
    wamid?: StringNullableFilter<"WhatsAppMessage"> | string | null
    phoneNumber?: StringFilter<"WhatsAppMessage"> | string
    direction?: StringFilter<"WhatsAppMessage"> | string
    type?: StringFilter<"WhatsAppMessage"> | string
    content?: StringFilter<"WhatsAppMessage"> | string
    status?: StringFilter<"WhatsAppMessage"> | string
    errorCode?: StringNullableFilter<"WhatsAppMessage"> | string | null
    errorMessage?: StringNullableFilter<"WhatsAppMessage"> | string | null
    metadata?: StringNullableFilter<"WhatsAppMessage"> | string | null
    isOptOut?: BoolFilter<"WhatsAppMessage"> | boolean
    createdAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
    updatedAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
  }

  export type WhatsAppMessageOrderByWithRelationInput = {
    id?: SortOrder
    wamid?: SortOrderInput | SortOrder
    phoneNumber?: SortOrder
    direction?: SortOrder
    type?: SortOrder
    content?: SortOrder
    status?: SortOrder
    errorCode?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    isOptOut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    wamid?: string
    AND?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    OR?: WhatsAppMessageWhereInput[]
    NOT?: WhatsAppMessageWhereInput | WhatsAppMessageWhereInput[]
    phoneNumber?: StringFilter<"WhatsAppMessage"> | string
    direction?: StringFilter<"WhatsAppMessage"> | string
    type?: StringFilter<"WhatsAppMessage"> | string
    content?: StringFilter<"WhatsAppMessage"> | string
    status?: StringFilter<"WhatsAppMessage"> | string
    errorCode?: StringNullableFilter<"WhatsAppMessage"> | string | null
    errorMessage?: StringNullableFilter<"WhatsAppMessage"> | string | null
    metadata?: StringNullableFilter<"WhatsAppMessage"> | string | null
    isOptOut?: BoolFilter<"WhatsAppMessage"> | boolean
    createdAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
    updatedAt?: DateTimeFilter<"WhatsAppMessage"> | Date | string
  }, "id" | "wamid">

  export type WhatsAppMessageOrderByWithAggregationInput = {
    id?: SortOrder
    wamid?: SortOrderInput | SortOrder
    phoneNumber?: SortOrder
    direction?: SortOrder
    type?: SortOrder
    content?: SortOrder
    status?: SortOrder
    errorCode?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    isOptOut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WhatsAppMessageCountOrderByAggregateInput
    _max?: WhatsAppMessageMaxOrderByAggregateInput
    _min?: WhatsAppMessageMinOrderByAggregateInput
  }

  export type WhatsAppMessageScalarWhereWithAggregatesInput = {
    AND?: WhatsAppMessageScalarWhereWithAggregatesInput | WhatsAppMessageScalarWhereWithAggregatesInput[]
    OR?: WhatsAppMessageScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppMessageScalarWhereWithAggregatesInput | WhatsAppMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    wamid?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    phoneNumber?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    direction?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    type?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    content?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    status?: StringWithAggregatesFilter<"WhatsAppMessage"> | string
    errorCode?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"WhatsAppMessage"> | string | null
    isOptOut?: BoolWithAggregatesFilter<"WhatsAppMessage"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"WhatsAppMessage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WhatsAppMessage"> | Date | string
  }

  export type WhatsAppOtpWhereInput = {
    AND?: WhatsAppOtpWhereInput | WhatsAppOtpWhereInput[]
    OR?: WhatsAppOtpWhereInput[]
    NOT?: WhatsAppOtpWhereInput | WhatsAppOtpWhereInput[]
    id?: StringFilter<"WhatsAppOtp"> | string
    phoneNumber?: StringFilter<"WhatsAppOtp"> | string
    otp?: StringFilter<"WhatsAppOtp"> | string
    purpose?: StringFilter<"WhatsAppOtp"> | string
    verified?: BoolFilter<"WhatsAppOtp"> | boolean
    expiresAt?: DateTimeFilter<"WhatsAppOtp"> | Date | string
    createdAt?: DateTimeFilter<"WhatsAppOtp"> | Date | string
  }

  export type WhatsAppOtpOrderByWithRelationInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    otp?: SortOrder
    purpose?: SortOrder
    verified?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppOtpWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WhatsAppOtpWhereInput | WhatsAppOtpWhereInput[]
    OR?: WhatsAppOtpWhereInput[]
    NOT?: WhatsAppOtpWhereInput | WhatsAppOtpWhereInput[]
    phoneNumber?: StringFilter<"WhatsAppOtp"> | string
    otp?: StringFilter<"WhatsAppOtp"> | string
    purpose?: StringFilter<"WhatsAppOtp"> | string
    verified?: BoolFilter<"WhatsAppOtp"> | boolean
    expiresAt?: DateTimeFilter<"WhatsAppOtp"> | Date | string
    createdAt?: DateTimeFilter<"WhatsAppOtp"> | Date | string
  }, "id">

  export type WhatsAppOtpOrderByWithAggregationInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    otp?: SortOrder
    purpose?: SortOrder
    verified?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: WhatsAppOtpCountOrderByAggregateInput
    _max?: WhatsAppOtpMaxOrderByAggregateInput
    _min?: WhatsAppOtpMinOrderByAggregateInput
  }

  export type WhatsAppOtpScalarWhereWithAggregatesInput = {
    AND?: WhatsAppOtpScalarWhereWithAggregatesInput | WhatsAppOtpScalarWhereWithAggregatesInput[]
    OR?: WhatsAppOtpScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppOtpScalarWhereWithAggregatesInput | WhatsAppOtpScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppOtp"> | string
    phoneNumber?: StringWithAggregatesFilter<"WhatsAppOtp"> | string
    otp?: StringWithAggregatesFilter<"WhatsAppOtp"> | string
    purpose?: StringWithAggregatesFilter<"WhatsAppOtp"> | string
    verified?: BoolWithAggregatesFilter<"WhatsAppOtp"> | boolean
    expiresAt?: DateTimeWithAggregatesFilter<"WhatsAppOtp"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"WhatsAppOtp"> | Date | string
  }

  export type WhatsAppWebhookLogWhereInput = {
    AND?: WhatsAppWebhookLogWhereInput | WhatsAppWebhookLogWhereInput[]
    OR?: WhatsAppWebhookLogWhereInput[]
    NOT?: WhatsAppWebhookLogWhereInput | WhatsAppWebhookLogWhereInput[]
    id?: StringFilter<"WhatsAppWebhookLog"> | string
    event?: StringFilter<"WhatsAppWebhookLog"> | string
    payload?: StringFilter<"WhatsAppWebhookLog"> | string
    processed?: BoolFilter<"WhatsAppWebhookLog"> | boolean
    createdAt?: DateTimeFilter<"WhatsAppWebhookLog"> | Date | string
  }

  export type WhatsAppWebhookLogOrderByWithRelationInput = {
    id?: SortOrder
    event?: SortOrder
    payload?: SortOrder
    processed?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppWebhookLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WhatsAppWebhookLogWhereInput | WhatsAppWebhookLogWhereInput[]
    OR?: WhatsAppWebhookLogWhereInput[]
    NOT?: WhatsAppWebhookLogWhereInput | WhatsAppWebhookLogWhereInput[]
    event?: StringFilter<"WhatsAppWebhookLog"> | string
    payload?: StringFilter<"WhatsAppWebhookLog"> | string
    processed?: BoolFilter<"WhatsAppWebhookLog"> | boolean
    createdAt?: DateTimeFilter<"WhatsAppWebhookLog"> | Date | string
  }, "id">

  export type WhatsAppWebhookLogOrderByWithAggregationInput = {
    id?: SortOrder
    event?: SortOrder
    payload?: SortOrder
    processed?: SortOrder
    createdAt?: SortOrder
    _count?: WhatsAppWebhookLogCountOrderByAggregateInput
    _max?: WhatsAppWebhookLogMaxOrderByAggregateInput
    _min?: WhatsAppWebhookLogMinOrderByAggregateInput
  }

  export type WhatsAppWebhookLogScalarWhereWithAggregatesInput = {
    AND?: WhatsAppWebhookLogScalarWhereWithAggregatesInput | WhatsAppWebhookLogScalarWhereWithAggregatesInput[]
    OR?: WhatsAppWebhookLogScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppWebhookLogScalarWhereWithAggregatesInput | WhatsAppWebhookLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppWebhookLog"> | string
    event?: StringWithAggregatesFilter<"WhatsAppWebhookLog"> | string
    payload?: StringWithAggregatesFilter<"WhatsAppWebhookLog"> | string
    processed?: BoolWithAggregatesFilter<"WhatsAppWebhookLog"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"WhatsAppWebhookLog"> | Date | string
  }

  export type WhatsAppConfigWhereInput = {
    AND?: WhatsAppConfigWhereInput | WhatsAppConfigWhereInput[]
    OR?: WhatsAppConfigWhereInput[]
    NOT?: WhatsAppConfigWhereInput | WhatsAppConfigWhereInput[]
    key?: StringFilter<"WhatsAppConfig"> | string
    value?: StringFilter<"WhatsAppConfig"> | string
    updatedAt?: DateTimeFilter<"WhatsAppConfig"> | Date | string
  }

  export type WhatsAppConfigOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppConfigWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    AND?: WhatsAppConfigWhereInput | WhatsAppConfigWhereInput[]
    OR?: WhatsAppConfigWhereInput[]
    NOT?: WhatsAppConfigWhereInput | WhatsAppConfigWhereInput[]
    value?: StringFilter<"WhatsAppConfig"> | string
    updatedAt?: DateTimeFilter<"WhatsAppConfig"> | Date | string
  }, "key">

  export type WhatsAppConfigOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
    _count?: WhatsAppConfigCountOrderByAggregateInput
    _max?: WhatsAppConfigMaxOrderByAggregateInput
    _min?: WhatsAppConfigMinOrderByAggregateInput
  }

  export type WhatsAppConfigScalarWhereWithAggregatesInput = {
    AND?: WhatsAppConfigScalarWhereWithAggregatesInput | WhatsAppConfigScalarWhereWithAggregatesInput[]
    OR?: WhatsAppConfigScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppConfigScalarWhereWithAggregatesInput | WhatsAppConfigScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"WhatsAppConfig"> | string
    value?: StringWithAggregatesFilter<"WhatsAppConfig"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"WhatsAppConfig"> | Date | string
  }

  export type WhatsAppConversationWhereInput = {
    AND?: WhatsAppConversationWhereInput | WhatsAppConversationWhereInput[]
    OR?: WhatsAppConversationWhereInput[]
    NOT?: WhatsAppConversationWhereInput | WhatsAppConversationWhereInput[]
    id?: StringFilter<"WhatsAppConversation"> | string
    wacId?: StringFilter<"WhatsAppConversation"> | string
    recipientMobile?: StringFilter<"WhatsAppConversation"> | string
    category?: StringFilter<"WhatsAppConversation"> | string
    isFreeTier?: BoolFilter<"WhatsAppConversation"> | boolean
    openedAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
    expiresAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
    cost?: FloatFilter<"WhatsAppConversation"> | number
    createdAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
  }

  export type WhatsAppConversationOrderByWithRelationInput = {
    id?: SortOrder
    wacId?: SortOrder
    recipientMobile?: SortOrder
    category?: SortOrder
    isFreeTier?: SortOrder
    openedAt?: SortOrder
    expiresAt?: SortOrder
    cost?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    wacId?: string
    AND?: WhatsAppConversationWhereInput | WhatsAppConversationWhereInput[]
    OR?: WhatsAppConversationWhereInput[]
    NOT?: WhatsAppConversationWhereInput | WhatsAppConversationWhereInput[]
    recipientMobile?: StringFilter<"WhatsAppConversation"> | string
    category?: StringFilter<"WhatsAppConversation"> | string
    isFreeTier?: BoolFilter<"WhatsAppConversation"> | boolean
    openedAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
    expiresAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
    cost?: FloatFilter<"WhatsAppConversation"> | number
    createdAt?: DateTimeFilter<"WhatsAppConversation"> | Date | string
  }, "id" | "wacId">

  export type WhatsAppConversationOrderByWithAggregationInput = {
    id?: SortOrder
    wacId?: SortOrder
    recipientMobile?: SortOrder
    category?: SortOrder
    isFreeTier?: SortOrder
    openedAt?: SortOrder
    expiresAt?: SortOrder
    cost?: SortOrder
    createdAt?: SortOrder
    _count?: WhatsAppConversationCountOrderByAggregateInput
    _avg?: WhatsAppConversationAvgOrderByAggregateInput
    _max?: WhatsAppConversationMaxOrderByAggregateInput
    _min?: WhatsAppConversationMinOrderByAggregateInput
    _sum?: WhatsAppConversationSumOrderByAggregateInput
  }

  export type WhatsAppConversationScalarWhereWithAggregatesInput = {
    AND?: WhatsAppConversationScalarWhereWithAggregatesInput | WhatsAppConversationScalarWhereWithAggregatesInput[]
    OR?: WhatsAppConversationScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppConversationScalarWhereWithAggregatesInput | WhatsAppConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppConversation"> | string
    wacId?: StringWithAggregatesFilter<"WhatsAppConversation"> | string
    recipientMobile?: StringWithAggregatesFilter<"WhatsAppConversation"> | string
    category?: StringWithAggregatesFilter<"WhatsAppConversation"> | string
    isFreeTier?: BoolWithAggregatesFilter<"WhatsAppConversation"> | boolean
    openedAt?: DateTimeWithAggregatesFilter<"WhatsAppConversation"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"WhatsAppConversation"> | Date | string
    cost?: FloatWithAggregatesFilter<"WhatsAppConversation"> | number
    createdAt?: DateTimeWithAggregatesFilter<"WhatsAppConversation"> | Date | string
  }

  export type WhatsAppAccountMetricWhereInput = {
    AND?: WhatsAppAccountMetricWhereInput | WhatsAppAccountMetricWhereInput[]
    OR?: WhatsAppAccountMetricWhereInput[]
    NOT?: WhatsAppAccountMetricWhereInput | WhatsAppAccountMetricWhereInput[]
    id?: StringFilter<"WhatsAppAccountMetric"> | string
    phoneNumberId?: StringNullableFilter<"WhatsAppAccountMetric"> | string | null
    qualityRating?: StringFilter<"WhatsAppAccountMetric"> | string
    messagingLimit?: StringFilter<"WhatsAppAccountMetric"> | string
    updatedAt?: DateTimeFilter<"WhatsAppAccountMetric"> | Date | string
  }

  export type WhatsAppAccountMetricOrderByWithRelationInput = {
    id?: SortOrder
    phoneNumberId?: SortOrderInput | SortOrder
    qualityRating?: SortOrder
    messagingLimit?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppAccountMetricWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WhatsAppAccountMetricWhereInput | WhatsAppAccountMetricWhereInput[]
    OR?: WhatsAppAccountMetricWhereInput[]
    NOT?: WhatsAppAccountMetricWhereInput | WhatsAppAccountMetricWhereInput[]
    phoneNumberId?: StringNullableFilter<"WhatsAppAccountMetric"> | string | null
    qualityRating?: StringFilter<"WhatsAppAccountMetric"> | string
    messagingLimit?: StringFilter<"WhatsAppAccountMetric"> | string
    updatedAt?: DateTimeFilter<"WhatsAppAccountMetric"> | Date | string
  }, "id">

  export type WhatsAppAccountMetricOrderByWithAggregationInput = {
    id?: SortOrder
    phoneNumberId?: SortOrderInput | SortOrder
    qualityRating?: SortOrder
    messagingLimit?: SortOrder
    updatedAt?: SortOrder
    _count?: WhatsAppAccountMetricCountOrderByAggregateInput
    _max?: WhatsAppAccountMetricMaxOrderByAggregateInput
    _min?: WhatsAppAccountMetricMinOrderByAggregateInput
  }

  export type WhatsAppAccountMetricScalarWhereWithAggregatesInput = {
    AND?: WhatsAppAccountMetricScalarWhereWithAggregatesInput | WhatsAppAccountMetricScalarWhereWithAggregatesInput[]
    OR?: WhatsAppAccountMetricScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppAccountMetricScalarWhereWithAggregatesInput | WhatsAppAccountMetricScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppAccountMetric"> | string
    phoneNumberId?: StringNullableWithAggregatesFilter<"WhatsAppAccountMetric"> | string | null
    qualityRating?: StringWithAggregatesFilter<"WhatsAppAccountMetric"> | string
    messagingLimit?: StringWithAggregatesFilter<"WhatsAppAccountMetric"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"WhatsAppAccountMetric"> | Date | string
  }

  export type WhatsAppTemplateWhereInput = {
    AND?: WhatsAppTemplateWhereInput | WhatsAppTemplateWhereInput[]
    OR?: WhatsAppTemplateWhereInput[]
    NOT?: WhatsAppTemplateWhereInput | WhatsAppTemplateWhereInput[]
    id?: StringFilter<"WhatsAppTemplate"> | string
    name?: StringFilter<"WhatsAppTemplate"> | string
    category?: StringFilter<"WhatsAppTemplate"> | string
    language?: StringFilter<"WhatsAppTemplate"> | string
    status?: StringFilter<"WhatsAppTemplate"> | string
    headerImageUrl?: StringNullableFilter<"WhatsAppTemplate"> | string | null
    createdAt?: DateTimeFilter<"WhatsAppTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"WhatsAppTemplate"> | Date | string
  }

  export type WhatsAppTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    language?: SortOrder
    status?: SortOrder
    headerImageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: WhatsAppTemplateWhereInput | WhatsAppTemplateWhereInput[]
    OR?: WhatsAppTemplateWhereInput[]
    NOT?: WhatsAppTemplateWhereInput | WhatsAppTemplateWhereInput[]
    category?: StringFilter<"WhatsAppTemplate"> | string
    language?: StringFilter<"WhatsAppTemplate"> | string
    status?: StringFilter<"WhatsAppTemplate"> | string
    headerImageUrl?: StringNullableFilter<"WhatsAppTemplate"> | string | null
    createdAt?: DateTimeFilter<"WhatsAppTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"WhatsAppTemplate"> | Date | string
  }, "id" | "name">

  export type WhatsAppTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    language?: SortOrder
    status?: SortOrder
    headerImageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WhatsAppTemplateCountOrderByAggregateInput
    _max?: WhatsAppTemplateMaxOrderByAggregateInput
    _min?: WhatsAppTemplateMinOrderByAggregateInput
  }

  export type WhatsAppTemplateScalarWhereWithAggregatesInput = {
    AND?: WhatsAppTemplateScalarWhereWithAggregatesInput | WhatsAppTemplateScalarWhereWithAggregatesInput[]
    OR?: WhatsAppTemplateScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppTemplateScalarWhereWithAggregatesInput | WhatsAppTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppTemplate"> | string
    name?: StringWithAggregatesFilter<"WhatsAppTemplate"> | string
    category?: StringWithAggregatesFilter<"WhatsAppTemplate"> | string
    language?: StringWithAggregatesFilter<"WhatsAppTemplate"> | string
    status?: StringWithAggregatesFilter<"WhatsAppTemplate"> | string
    headerImageUrl?: StringNullableWithAggregatesFilter<"WhatsAppTemplate"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"WhatsAppTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WhatsAppTemplate"> | Date | string
  }

  export type WhatsAppEventTriggerWhereInput = {
    AND?: WhatsAppEventTriggerWhereInput | WhatsAppEventTriggerWhereInput[]
    OR?: WhatsAppEventTriggerWhereInput[]
    NOT?: WhatsAppEventTriggerWhereInput | WhatsAppEventTriggerWhereInput[]
    id?: StringFilter<"WhatsAppEventTrigger"> | string
    eventName?: StringFilter<"WhatsAppEventTrigger"> | string
    templateName?: StringNullableFilter<"WhatsAppEventTrigger"> | string | null
    isActive?: BoolFilter<"WhatsAppEventTrigger"> | boolean
    variableMap?: StringNullableFilter<"WhatsAppEventTrigger"> | string | null
    updatedAt?: DateTimeFilter<"WhatsAppEventTrigger"> | Date | string
  }

  export type WhatsAppEventTriggerOrderByWithRelationInput = {
    id?: SortOrder
    eventName?: SortOrder
    templateName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    variableMap?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppEventTriggerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    eventName?: string
    AND?: WhatsAppEventTriggerWhereInput | WhatsAppEventTriggerWhereInput[]
    OR?: WhatsAppEventTriggerWhereInput[]
    NOT?: WhatsAppEventTriggerWhereInput | WhatsAppEventTriggerWhereInput[]
    templateName?: StringNullableFilter<"WhatsAppEventTrigger"> | string | null
    isActive?: BoolFilter<"WhatsAppEventTrigger"> | boolean
    variableMap?: StringNullableFilter<"WhatsAppEventTrigger"> | string | null
    updatedAt?: DateTimeFilter<"WhatsAppEventTrigger"> | Date | string
  }, "id" | "eventName">

  export type WhatsAppEventTriggerOrderByWithAggregationInput = {
    id?: SortOrder
    eventName?: SortOrder
    templateName?: SortOrderInput | SortOrder
    isActive?: SortOrder
    variableMap?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: WhatsAppEventTriggerCountOrderByAggregateInput
    _max?: WhatsAppEventTriggerMaxOrderByAggregateInput
    _min?: WhatsAppEventTriggerMinOrderByAggregateInput
  }

  export type WhatsAppEventTriggerScalarWhereWithAggregatesInput = {
    AND?: WhatsAppEventTriggerScalarWhereWithAggregatesInput | WhatsAppEventTriggerScalarWhereWithAggregatesInput[]
    OR?: WhatsAppEventTriggerScalarWhereWithAggregatesInput[]
    NOT?: WhatsAppEventTriggerScalarWhereWithAggregatesInput | WhatsAppEventTriggerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WhatsAppEventTrigger"> | string
    eventName?: StringWithAggregatesFilter<"WhatsAppEventTrigger"> | string
    templateName?: StringNullableWithAggregatesFilter<"WhatsAppEventTrigger"> | string | null
    isActive?: BoolWithAggregatesFilter<"WhatsAppEventTrigger"> | boolean
    variableMap?: StringNullableWithAggregatesFilter<"WhatsAppEventTrigger"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"WhatsAppEventTrigger"> | Date | string
  }

  export type WhatsAppMessageCreateInput = {
    id?: string
    wamid?: string | null
    phoneNumber: string
    direction: string
    type: string
    content: string
    status: string
    errorCode?: string | null
    errorMessage?: string | null
    metadata?: string | null
    isOptOut?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppMessageUncheckedCreateInput = {
    id?: string
    wamid?: string | null
    phoneNumber: string
    direction: string
    type: string
    content: string
    status: string
    errorCode?: string | null
    errorMessage?: string | null
    metadata?: string | null
    isOptOut?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wamid?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    errorCode?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    isOptOut?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wamid?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    errorCode?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    isOptOut?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageCreateManyInput = {
    id?: string
    wamid?: string | null
    phoneNumber: string
    direction: string
    type: string
    content: string
    status: string
    errorCode?: string | null
    errorMessage?: string | null
    metadata?: string | null
    isOptOut?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    wamid?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    errorCode?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    isOptOut?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wamid?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    errorCode?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    isOptOut?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppOtpCreateInput = {
    id?: string
    phoneNumber: string
    otp: string
    purpose: string
    verified?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type WhatsAppOtpUncheckedCreateInput = {
    id?: string
    phoneNumber: string
    otp: string
    purpose: string
    verified?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type WhatsAppOtpUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    otp?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    verified?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppOtpUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    otp?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    verified?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppOtpCreateManyInput = {
    id?: string
    phoneNumber: string
    otp: string
    purpose: string
    verified?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type WhatsAppOtpUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    otp?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    verified?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppOtpUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    otp?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    verified?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppWebhookLogCreateInput = {
    id?: string
    event: string
    payload: string
    processed?: boolean
    createdAt?: Date | string
  }

  export type WhatsAppWebhookLogUncheckedCreateInput = {
    id?: string
    event: string
    payload: string
    processed?: boolean
    createdAt?: Date | string
  }

  export type WhatsAppWebhookLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    payload?: StringFieldUpdateOperationsInput | string
    processed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppWebhookLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    payload?: StringFieldUpdateOperationsInput | string
    processed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppWebhookLogCreateManyInput = {
    id?: string
    event: string
    payload: string
    processed?: boolean
    createdAt?: Date | string
  }

  export type WhatsAppWebhookLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    payload?: StringFieldUpdateOperationsInput | string
    processed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppWebhookLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    event?: StringFieldUpdateOperationsInput | string
    payload?: StringFieldUpdateOperationsInput | string
    processed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConfigCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type WhatsAppConfigUncheckedCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type WhatsAppConfigUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConfigUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConfigCreateManyInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type WhatsAppConfigUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConfigUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConversationCreateInput = {
    id?: string
    wacId: string
    recipientMobile: string
    category: string
    isFreeTier?: boolean
    openedAt: Date | string
    expiresAt: Date | string
    cost?: number
    createdAt?: Date | string
  }

  export type WhatsAppConversationUncheckedCreateInput = {
    id?: string
    wacId: string
    recipientMobile: string
    category: string
    isFreeTier?: boolean
    openedAt: Date | string
    expiresAt: Date | string
    cost?: number
    createdAt?: Date | string
  }

  export type WhatsAppConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wacId?: StringFieldUpdateOperationsInput | string
    recipientMobile?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    isFreeTier?: BoolFieldUpdateOperationsInput | boolean
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cost?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wacId?: StringFieldUpdateOperationsInput | string
    recipientMobile?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    isFreeTier?: BoolFieldUpdateOperationsInput | boolean
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cost?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConversationCreateManyInput = {
    id?: string
    wacId: string
    recipientMobile: string
    category: string
    isFreeTier?: boolean
    openedAt: Date | string
    expiresAt: Date | string
    cost?: number
    createdAt?: Date | string
  }

  export type WhatsAppConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    wacId?: StringFieldUpdateOperationsInput | string
    recipientMobile?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    isFreeTier?: BoolFieldUpdateOperationsInput | boolean
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cost?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wacId?: StringFieldUpdateOperationsInput | string
    recipientMobile?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    isFreeTier?: BoolFieldUpdateOperationsInput | boolean
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cost?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppAccountMetricCreateInput = {
    id?: string
    phoneNumberId?: string | null
    qualityRating?: string
    messagingLimit?: string
    updatedAt?: Date | string
  }

  export type WhatsAppAccountMetricUncheckedCreateInput = {
    id?: string
    phoneNumberId?: string | null
    qualityRating?: string
    messagingLimit?: string
    updatedAt?: Date | string
  }

  export type WhatsAppAccountMetricUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumberId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityRating?: StringFieldUpdateOperationsInput | string
    messagingLimit?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppAccountMetricUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumberId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityRating?: StringFieldUpdateOperationsInput | string
    messagingLimit?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppAccountMetricCreateManyInput = {
    id?: string
    phoneNumberId?: string | null
    qualityRating?: string
    messagingLimit?: string
    updatedAt?: Date | string
  }

  export type WhatsAppAccountMetricUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumberId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityRating?: StringFieldUpdateOperationsInput | string
    messagingLimit?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppAccountMetricUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phoneNumberId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityRating?: StringFieldUpdateOperationsInput | string
    messagingLimit?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppTemplateCreateInput = {
    id?: string
    name: string
    category?: string
    language?: string
    status: string
    headerImageUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppTemplateUncheckedCreateInput = {
    id?: string
    name: string
    category?: string
    language?: string
    status: string
    headerImageUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    headerImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    headerImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppTemplateCreateManyInput = {
    id?: string
    name: string
    category?: string
    language?: string
    status: string
    headerImageUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WhatsAppTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    headerImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    headerImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppEventTriggerCreateInput = {
    id?: string
    eventName: string
    templateName?: string | null
    isActive?: boolean
    variableMap?: string | null
    updatedAt?: Date | string
  }

  export type WhatsAppEventTriggerUncheckedCreateInput = {
    id?: string
    eventName: string
    templateName?: string | null
    isActive?: boolean
    variableMap?: string | null
    updatedAt?: Date | string
  }

  export type WhatsAppEventTriggerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    variableMap?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppEventTriggerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    variableMap?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppEventTriggerCreateManyInput = {
    id?: string
    eventName: string
    templateName?: string | null
    isActive?: boolean
    variableMap?: string | null
    updatedAt?: Date | string
  }

  export type WhatsAppEventTriggerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    variableMap?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WhatsAppEventTriggerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    variableMap?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type WhatsAppMessageCountOrderByAggregateInput = {
    id?: SortOrder
    wamid?: SortOrder
    phoneNumber?: SortOrder
    direction?: SortOrder
    type?: SortOrder
    content?: SortOrder
    status?: SortOrder
    errorCode?: SortOrder
    errorMessage?: SortOrder
    metadata?: SortOrder
    isOptOut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    wamid?: SortOrder
    phoneNumber?: SortOrder
    direction?: SortOrder
    type?: SortOrder
    content?: SortOrder
    status?: SortOrder
    errorCode?: SortOrder
    errorMessage?: SortOrder
    metadata?: SortOrder
    isOptOut?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppMessageMinOrderByAggregateInput = {
    id?: SortOrder
    wamid?: SortOrder
    phoneNumber?: SortOrder
    direction?: SortOrder
    type?: SortOrder
    content?: SortOrder
    status?: SortOrder
    errorCode?: SortOrder
    errorMessage?: SortOrder
    metadata?: SortOrder
    isOptOut?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type WhatsAppOtpCountOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    otp?: SortOrder
    purpose?: SortOrder
    verified?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppOtpMaxOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    otp?: SortOrder
    purpose?: SortOrder
    verified?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppOtpMinOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    otp?: SortOrder
    purpose?: SortOrder
    verified?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppWebhookLogCountOrderByAggregateInput = {
    id?: SortOrder
    event?: SortOrder
    payload?: SortOrder
    processed?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppWebhookLogMaxOrderByAggregateInput = {
    id?: SortOrder
    event?: SortOrder
    payload?: SortOrder
    processed?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppWebhookLogMinOrderByAggregateInput = {
    id?: SortOrder
    event?: SortOrder
    payload?: SortOrder
    processed?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppConfigCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppConfigMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppConfigMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
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

  export type WhatsAppConversationCountOrderByAggregateInput = {
    id?: SortOrder
    wacId?: SortOrder
    recipientMobile?: SortOrder
    category?: SortOrder
    isFreeTier?: SortOrder
    openedAt?: SortOrder
    expiresAt?: SortOrder
    cost?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppConversationAvgOrderByAggregateInput = {
    cost?: SortOrder
  }

  export type WhatsAppConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    wacId?: SortOrder
    recipientMobile?: SortOrder
    category?: SortOrder
    isFreeTier?: SortOrder
    openedAt?: SortOrder
    expiresAt?: SortOrder
    cost?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppConversationMinOrderByAggregateInput = {
    id?: SortOrder
    wacId?: SortOrder
    recipientMobile?: SortOrder
    category?: SortOrder
    isFreeTier?: SortOrder
    openedAt?: SortOrder
    expiresAt?: SortOrder
    cost?: SortOrder
    createdAt?: SortOrder
  }

  export type WhatsAppConversationSumOrderByAggregateInput = {
    cost?: SortOrder
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

  export type WhatsAppAccountMetricCountOrderByAggregateInput = {
    id?: SortOrder
    phoneNumberId?: SortOrder
    qualityRating?: SortOrder
    messagingLimit?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppAccountMetricMaxOrderByAggregateInput = {
    id?: SortOrder
    phoneNumberId?: SortOrder
    qualityRating?: SortOrder
    messagingLimit?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppAccountMetricMinOrderByAggregateInput = {
    id?: SortOrder
    phoneNumberId?: SortOrder
    qualityRating?: SortOrder
    messagingLimit?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    language?: SortOrder
    status?: SortOrder
    headerImageUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    language?: SortOrder
    status?: SortOrder
    headerImageUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    language?: SortOrder
    status?: SortOrder
    headerImageUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppEventTriggerCountOrderByAggregateInput = {
    id?: SortOrder
    eventName?: SortOrder
    templateName?: SortOrder
    isActive?: SortOrder
    variableMap?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppEventTriggerMaxOrderByAggregateInput = {
    id?: SortOrder
    eventName?: SortOrder
    templateName?: SortOrder
    isActive?: SortOrder
    variableMap?: SortOrder
    updatedAt?: SortOrder
  }

  export type WhatsAppEventTriggerMinOrderByAggregateInput = {
    id?: SortOrder
    eventName?: SortOrder
    templateName?: SortOrder
    isActive?: SortOrder
    variableMap?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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