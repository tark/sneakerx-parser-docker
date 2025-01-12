import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem, AsyncCollection } from "@aws-amplify/datastore";

type EagerOriginalProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OriginalProduct, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly brand?: string | null;
  readonly photos?: (string | null)[] | null;
  readonly color?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOriginalProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OriginalProduct, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly brand?: string | null;
  readonly photos?: (string | null)[] | null;
  readonly color?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type OriginalProduct = LazyLoading extends LazyLoadingDisabled ? EagerOriginalProduct : LazyOriginalProduct

export declare const OriginalProduct: (new (init: ModelInit<OriginalProduct>) => OriginalProduct) & {
  copyOf(source: OriginalProduct, mutator: (draft: MutableModel<OriginalProduct>) => MutableModel<OriginalProduct> | void): OriginalProduct;
}

type EagerProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly brand?: string | null;
  readonly price?: number | null;
  readonly sizes?: (number | null)[] | null;
  readonly store?: Store | null;
  readonly storeId: string;
  readonly description?: string | null;
  readonly photos?: (string | null)[] | null;
  readonly hidden?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly storeProductsId?: string | null;
}

type LazyProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly brand?: string | null;
  readonly price?: number | null;
  readonly sizes?: (number | null)[] | null;
  readonly store: AsyncItem<Store | undefined>;
  readonly storeId: string;
  readonly description?: string | null;
  readonly photos?: (string | null)[] | null;
  readonly hidden?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly storeProductsId?: string | null;
}

export declare type Product = LazyLoading extends LazyLoadingDisabled ? EagerProduct : LazyProduct

export declare const Product: (new (init: ModelInit<Product>) => Product) & {
  copyOf(source: Product, mutator: (draft: MutableModel<Product>) => MutableModel<Product> | void): Product;
}

type EagerStore = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Store, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly country?: string | null;
  readonly products?: (Product | null)[] | null;
  readonly phoneNumber?: string | null;
  readonly facebookUrl?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStore = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Store, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly country?: string | null;
  readonly products: AsyncCollection<Product>;
  readonly phoneNumber?: string | null;
  readonly facebookUrl?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Store = LazyLoading extends LazyLoadingDisabled ? EagerStore : LazyStore

export declare const Store: (new (init: ModelInit<Store>) => Store) & {
  copyOf(source: Store, mutator: (draft: MutableModel<Store>) => MutableModel<Store> | void): Store;
}

type EagerSubscriber = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Subscriber, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly email: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySubscriber = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Subscriber, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly email: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Subscriber = LazyLoading extends LazyLoadingDisabled ? EagerSubscriber : LazySubscriber

export declare const Subscriber: (new (init: ModelInit<Subscriber>) => Subscriber) & {
  copyOf(source: Subscriber, mutator: (draft: MutableModel<Subscriber>) => MutableModel<Subscriber> | void): Subscriber;
}
