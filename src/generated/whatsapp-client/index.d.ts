
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
    WhatsAppWebhookLog: 'WhatsAppWebhookLog'
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
      modelProps: "whatsAppMessage" | "whatsAppOtp" | "whatsAppWebhookLog"
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
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WhatsAppMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wamid" | "phoneNumber" | "direction" | "type" | "content" | "status" | "errorCode" | "errorMessage" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["whatsAppMessage"]>

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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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