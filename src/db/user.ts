import mongoClient from "./mongo";

import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface UserProps {
  name: string;
  username: string;
  email: string;
  image: string;
  bio: string;
  bioMdx: MDXRemoteSerializeResult<Record<string, unknown>>;
  followers: number;
  verified: boolean;
}

export interface ResultProps {
  _id: string;
  users: UserProps[];
}

export async function getAllUsers(): Promise<ResultProps[]> {
    const client = await clientPromise;
    const collection = client.db('test').collection('users');
    return await collection
      .aggregate<ResultProps>([
        {
          //sort by follower count
          $sort: {
            followers: -1
          }
        },
        {
          $limit: 100
        },
        {
          $group: {
            _id: {
              $toLower: { $substrCP: ['$name', 0, 1] }
            },
            users: {
              $push: {
                name: '$name',
                username: '$username',
                email: '$email',
                image: '$image',
                followers: '$followers',
                verified: '$verified'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          //sort alphabetically
          $sort: {
            _id: 1
          }
        }
      ])
      .toArray();
  }
  
  