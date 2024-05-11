'use server';
import 'server-only';
import { redirect } from 'next/navigation';

export async function toUserPage() {
  redirect('./user');
}
