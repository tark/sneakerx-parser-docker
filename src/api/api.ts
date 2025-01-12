import JSON5 from 'json5'
import {Product, OriginalProduct, Store} from "../models"
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3"
import axios from "axios"
import {writeFile} from 'fs/promises'
import {Buffer} from 'buffer'
import {configDotenv} from 'dotenv'
import {stringify} from "../util/object_util"
import {capitalize, removeStrings} from "../util/string_util"
import {defaultProvider} from "@aws-sdk/credential-provider-node"
import {Sha256} from "@aws-crypto/sha256-js"

const {SignatureV4} = require("@aws-sdk/signature-v4")
const {HttpRequest} = require("@aws-sdk/protocol-http")

configDotenv()

const graphqlEndpoint = process.env.API_SHOESPRICEPHOTOS_GRAPHQLAPIENDPOINTOUTPUT ?? ''

type EqFilter = {
  field: string
  value: string
}

export interface GetProductsParams {
  priceFrom?: string
  priceTo?: string
  search?: string
  nextToken?: string
}

export interface ProductsPageData {
  products: Product[]
  nextToken?: string
}

type Options = {
  apiKey?: string
  idToken?: string
}

//
const request = async (query: string, options?: Options) => {

  const {apiKey, idToken} = options ?? {}

  let response

  if (apiKey) {
    response = await axios.request({
      url: graphqlEndpoint,
      method: 'POST',
      data: JSON.stringify({query}),
      headers: {
        'x-api-key': apiKey,
      },
    })
  } else if (idToken) {
    response = await axios.request({
      url: graphqlEndpoint,
      method: 'POST',
      data: JSON.stringify({query}),
      headers: {
        'authorization': idToken,
      },
    })
  } else {

    const endpoint = new URL(graphqlEndpoint)

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: 'us-east-2',
      service: "appsync",
      sha256: Sha256,
    })

    const requestToBeSigned = new HttpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: endpoint.host,
      },
      hostname: endpoint.host,
      body: JSON.stringify({query}),
      path: endpoint.pathname,
    })

    const signed = await signer.sign(requestToBeSigned);

    console.log(`request - url - https://${signed.hostname}${signed.path}`)

    response = await axios.request({
      url: `https://${signed.hostname}${signed.path}`,
      method: signed.method,
      data: JSON.stringify({query}),
      headers: signed.headers,
    })
  }

  const {data: {data, errors}} = response

  if (errors && errors.length != 0) {
    throw new Error(errors[0].message)
  }

  return data


}


// const request = async (query: string): Promise<any> => {
//
//   try {
//
//     const result = await graphQLClient.request<any>(query)
//
//     const {errors} = result
//
//     if (errors && errors.length > 0) {
//       throw errors[0].message;
//     }
//
//     return result
//   } catch (e) {
//     throw e
//   }
// }

const get = async <T>(queryName: string, id: string, fields?: string[]): Promise<T> => {
  const data = await request(`
    query MyQuery {
      ${queryName}(id: "${id}") {
        ${(fields ?? ['id']).join('\n')}
      }
    }
  `)

  return data[queryName];
}

const getList = async <T>(queryName: string, fields?: string[], eqFilter?: EqFilter, parameter?: EqFilter): Promise<T[]> => {

  let filter = ''
  if (eqFilter) {
    const {field, value} = eqFilter
    switch (typeof value) {
      case 'string':
        filter = `filter: {${field}: {eq: "${value}"}}`
        break
      case 'boolean':
      case 'number':
      default:
        filter = `filter: {${field}: {eq: ${value}}}`
        break
    }
  }

  let nextToken = ''
  let allItems: T[] = []

  // Fetch data in a loop while nextToken is not empty
  do {
    const parameterString = !!parameter ? `${parameter.field}: "${parameter.value}"` : ''
    const nextTokenString = !!nextToken ? `nextToken: "${nextToken}"` : ''
    const filterString = filter || nextTokenString || parameterString
      ? `(${[filter, nextTokenString, parameterString].filter(e => !!e).join(',')})`
      : ''

    const data = await request(`
      query MyQuery {
        ${queryName}${filterString} {
          items {
            ${(fields ?? ['id']).join('\n')}
          }
          nextToken                  
        }
      }
    `)

    const items = data[queryName]?.items ?? []
    allItems = [
      ...allItems,
      ...items
    ]
    nextToken = data[queryName]?.nextToken
  } while (!!nextToken)

  return allItems

}

const getFirstOrNull = async <T>(queryName: string, fields: string[], eqFilter?: EqFilter): Promise<T | null> => {
  const list = await getList<T>(queryName, fields, eqFilter)
  if (!list || !list.length) {
    return null
  }

  return list[0]
}

const create = async <T>(queryName: string, input: T, fields?: string[]): Promise<T> => {
  // console.log(`create`)
  const data = await request(`
    mutation MyMutation {
      ${queryName}(input: ${JSON5.stringify(input, {quote: '"'})}) {
        ${(fields ?? ['id']).join('\n')}
      }
    }
  `)
  return data[queryName] as T;
}

const update = async <T>(queryName: string, modelId: string, input: any, fields?: string[]): Promise<T> => {
  console.log(`update`)
  delete input.createdAt
  delete input.updatedAt

  const data = await request(`
    mutation MyMutation {
      ${queryName}(input: ${JSON5.stringify({...input, id: modelId}, {quote: '"'})}) {
        ${(fields ?? ['id']).join('\n')}
      }
    }
  `)
  return data[queryName] as T;
}

const remove = async <T>(queryName: string, modelId: string): Promise<T> => {
  const data = await request(`
    mutation MyMutation {
      ${queryName}(input: {id: "${modelId}"}) {
        id
      }
    }
  `)
  return data[queryName] as T;
}

const blobToBuffer = async (blob: Blob): Promise<Buffer> => {
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

//
export const getProduct = async (params: string[]): Promise<Product> => {
  const [, productId] = params
  const response = await request(`
    query MyQuery {
      getProduct(id: "${productId}") {
        id
        name
        price
        storeId
        description
        photos
        brand
        createdAt
        store {
          id
          name
          address
          city
          country
          phoneNumber
        }
      }
    }
  `)

  console.log(`getProduct - ${JSON.stringify(response.getProduct)}`)
  return {...response.getProduct, store: response.getProduct.store}
}

export const getProducts = async (params: GetProductsParams[]): Promise<ProductsPageData> => {

  try {

    const [, getParams] = params

    const {
      priceFrom,
      priceTo,
      search,
      nextToken
    } = getParams

    const nextTokenString = !nextToken ? '' : `, nextToken: "${nextToken}"`

    const query = search ?? ''
    const filterObject = {
      price: {
        ge: priceFrom ?? 0,
        le: priceTo ?? 99999999,
      },
      or: [
        {name: {contains: query}},
        {name: {contains: query.toLowerCase()}},
        {name: {contains: query.toUpperCase()}},
        {name: {contains: capitalize(query)}},
      ],
    }


    const result = await request(`
      query MyQuery {
        listProducts (
          filter: ${stringify(filterObject)},
          limit: 10000,
          ${nextTokenString}
        ) {
          items {
            id
            name
            price
            brand
            createdAt
            store {
              id
              name
            }
            storeId
            description
            photos
          }
          nextToken
        }
      }
    `);

    const newProducts: Product[] = result.listProducts.items.map((i: any) => ({
      ...i,
      createdAt: i.createdAt ?? new Date()
    }))

    return {
      products: newProducts,
      nextToken: result.listProducts.nextToken
    }

  } catch (e: any) {
    console.log(`getProducts - error: ${e?.stack}`)
    return {
      products: [],
    }
  }
}

export const getOriginalProductsAll = async (): Promise<OriginalProduct[]> => {
  console.log(`getOriginalProductsAll`)
  const result = await request(`
    query MyQuery {
      listOriginalProducts(limit: 10000) {
        items {
          id
          name
          brand
          photos
          color
          createdAt
          updatedAt
        }
      }
    }
  `);
  return result.listOriginalProducts.items ?? []
}

export const getSameProductInStoreOld = async (storeId: string, productName: string): Promise<Product | undefined> => {
  console.log(`getSameProductInStore - productName: ${productName}`)

  const response = await request(`
    query MyQuery {
      listProducts(filter: {name: {eq: "${productName}"}, storeId: {eq: "${storeId}"}}) {
        items {
          id
          brand
          name
          storeId
        }
      }
    }
  `)
  console.log(`getSameProductInStore - response: `, response.listProducts.items)
  console.log(`getSameProductInStore - ----`)

  const items = response.listProducts.items
  return items.length == 0 ? undefined : items[0]
}

export const getSameProductInStore = async (storeId: string, productName: string): Promise<Product | undefined> => {
  console.log(`getSameProductInStore - productName: ${productName}`)

  const response = await request(`
    query MyQuery {
      productsByName(name: "${productName}") {
        items {
          id
          brand
          name
          storeId
        }
      }
    }
  `)

  console.log(`getSameProductInStore - response: `, response)
  // console.log(`getSameProductInStore - response: `, response.productsByName.items)
  console.log(`getSameProductInStore - ----`)

  const items = response.productsByName.items

  return items.find((i: any) => i.storeId === storeId)

  // return items.length == 0 ? undefined : items[0]
}

export const createProduct = async (product: Product): Promise<Product | undefined> => {
  return create('createProduct', product, ['id'])
}

export const createOriginalProduct = async (product: OriginalProduct): Promise<OriginalProduct | undefined> => {
  return create('createOriginalProduct', product, ['id'])
}

export const updateProduct = async (product: Product): Promise<Product> => {
  return update<Product>(
    'updateProduct',
    product.id ?? '',
    product,
    ['id']
  )
}

export const getStore = async (params: string[]): Promise<Store> => {
  const [, storeId] = params
  const store = await get<Store>(
    'getStore',
    storeId,
    [
      'id',
      'name',
      'latitude',
      'longitude',
      'address',
      'city',
      'country',
      'phoneNumber',
      'createdAt',
      'updatedAt'
    ]
  )

  return store
}

export const getStores = async (): Promise<Store[]> => {
  const stores = await request(`
    query MyQuery {
      listStores {
        items {
          id
          address
          city
          country
          createdAt
          facebookUrl
          id
          latitude
          longitude
          name
          phoneNumber
          updatedAt
          phoneNumber
        }
      }
    }
  `)

  console.log(`getStores - stores: `, stores)

  return stores.listStores.items
}

export const createStore = async (url: string, data: any): Promise<Store | undefined> => {
  const store = data.arg
  return create('createStore', store, ['id'])
}

export const updateStore = async (url: string, data: any): Promise<Store> => {
  const store: Store = data.arg
  return update<Store>(
    'updateStore',
    store.id ?? '',
    store,
    [
      'id',
      'name',
      'latitude',
      'longitude',
      'address',
      'city',
      'country',
      'createdAt',
      'updatedAt'
    ]
  )
}

export const uploadFile = async (blob: Blob, fileName: string): Promise<string> => {
  // console.log(`uploadFile`)

  try {
    const bucketName = 'shoes-price-photos';
    const region = 'us-east-2';

    const buffer = await blobToBuffer(blob)
    const response = await new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY ?? '',
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY ?? '',
      }
    })
      .send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
      }));

    // console.log(`uploadFile - response: `, response)

    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  } catch (e) {
    console.log(`uploadFile - error: ${e}`)
    throw e
  }


}

export const downloadImage = async (url: string): Promise<Blob> => {
  console.log(`downloadImage`)
  // Fetch the image as a binary
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  const buffer = Buffer.from(response.data, 'binary');

  // Write the file to disk (optional)
  const filePath = './downloaded-image.jpg';
  await writeFile(filePath, buffer);

  // Create a Blob and convert to File
  return new Blob([buffer], {type: 'image/jpeg'});

  // If you need to use File object (browser-like)
  // return new File([blob], 'downloaded-image.jpg', { type: 'image/jpeg' });

}

export const getSerpApiResponse = async (imageUrl: string): Promise<any> => {
  console.log(`getSerpApiResponse - ${imageUrl}`)

  try {
    const response = await request(`
      query MyQuery {
        serpApiProxy(input: "${imageUrl}")
      }
    `);
    return JSON.parse(response.serpApiProxy)
  } catch (e) {
    console.log(`uploadFile - error: ${e}`)
    throw e
  }
}

export const getModelNameFromOpenAI = async (text: string): Promise<string> => {
  // console.log(`getModelNameFromOpenAI - ${text}`)
  // const result: any = await axios.get('https://ipapi.co/json/')

  const elements = JSON.parse(text)
  const titles = elements.map((e: any) => removeStrings(
    e.title.replaceAll('|', ''), [
      'offer',
      'eBay',
      'instagram',
      'facebook',
      'shoes',
      'sneakers',
      'outlet',
      'sale',
      'size',
      'womens',
      'women',
      'woman',
      'online',
      'price',
      'prices',
      'amazon.com',
      'amazon.co.uk',
      'amazon.ae',
      'shop',
      'YouTube',
      'TikTok',
      'read',
      'description',
      'footy.com',
      'photos',
      'videos',
      'and',
      'Best Deals',
      'best deals',
      'malaysia',
      'today',
    ]
  ))

  console.log(`getModelNameFromOpenAI - titles: ${titles}`)

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: `What sneaker brand and model? (answer format: $brand,$model): ${titles}`
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      }
    }
  )

  console.log(`getModelNameFromOpenAI - response: `, response)

  return response.data.choices[0].message.content

}
