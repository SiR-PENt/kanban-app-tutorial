import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
// additionally import the doc and updateDoc method from firestore
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/components/app/utils/firebaseConfig";

export const fireStoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    fetchDataFromDb: builder.query<{ [key: string]: any }[], void>({
      async queryFn() {
        try {
          const session = await getSession();
          if (session?.user) {
            const { user } = session;
            const ref = collection(db, `users/${user.email}/tasks`);
            const querySnapshot = await getDocs(ref);
            return { data: querySnapshot.docs.map((doc) => doc.data()) };
          }
        } catch (e) {
          return { error: e };
        }
      },
      providesTags: ["Tasks"],
    }),
    // endpoint for CRUD actions
    updateBoardToDb: builder.mutation<
      { data: null } | { error: unknown },
      { [key: string]: any }
    >({
      async queryFn(boardData) {
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
              boards: boardData,
            });
          }
          return { data: null };
        } catch (e) {
          return { error: e };
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
