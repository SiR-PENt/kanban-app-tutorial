import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
// additionally import the doc and updateDoc method from firestore
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/components/app/utils/firebaseConfig";


export interface SingleBoardData {
  id: string;
  name: string;
  columns: {id: string, name: string, tasks: {id: string, status: string, title: string }[] }[];
}

export type Boards = { boards: SingleBoardData[]};
export type BoardsArray = Boards[];

export interface Score {
  id?: string;
  name: string;
  time: number;
}

export interface ScoresTable {
  id: string;
  levelId: string;
  scores?: Score[];
}

export type ScoresTables = ScoresTable[];

export const fireStoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    fetchDataFromDb: builder.query<{[key: string]: any}[], void>({
      async queryFn() {
        try {
          const session = await getSession();
            const { user } = session!;
            const ref = collection(db, `users/${user?.email}/tasks`);
            const querySnapshot = await getDocs(ref);
            const boards = querySnapshot.docs.map((doc) => {
              return doc.data()});
            return { data: boards };
        } catch (e: any) {
          return { error: e.message };
        }
      },
      providesTags: ["Tasks"],
    }),
    // endpoint for CRUD actions
    updateBoardToDb: builder.mutation({
      async queryFn(arg) {
        try {
          const session = await getSession();
          if (session?.user) {
            const { user } = session;
            const ref = collection(db, `users/${user.email}/tasks`);
            const querySnapshot = await getDocs(ref);
            const boardId = querySnapshot.docs.map((doc) => {
              return doc.id;
            });
            await updateDoc(doc(db, `users/${user.email}/tasks/${boardId}`), {
              boards: arg,
            });
          }
          return Promise.resolve({ data: null });
        } catch (e) {
          return Promise.resolve({ error: e });
        }
      },
      invalidatesTags: ["Tasks"], // this will be used to invalidate the initially fetched data. 
      // Data will have to be refetched once this enpoint has been called
    }),
  }),
});

// Export hooks for using the created endpoint
export const { useFetchDataFromDbQuery, useUpdateBoardToDbMutation } =
  fireStoreApi;
