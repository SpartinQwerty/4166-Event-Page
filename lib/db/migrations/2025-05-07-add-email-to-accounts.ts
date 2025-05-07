import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    // Check if the email column already exists
    const columnExists = await db.selectFrom('information_schema.columns')
      .select('column_name')
      .where('table_name', '=', 'accounts')
      .where('column_name', '=', 'email')
      .executeTakeFirst();

    if (!columnExists) {
      console.log('Adding email column to accounts table...');
      
      // Add the email column
      await db.schema
        .alterTable('accounts')
        .addColumn('email', 'text', (col) => col.notNull().defaultTo(''))
        .execute();
      
      console.log('Email column added successfully');
      
      // Update existing accounts to use username as email
      await db.updateTable('accounts')
        .set({ email: sql`username` })
        .execute();
      
      console.log('Existing accounts updated with email values');
    } else {
      console.log('Email column already exists in accounts table');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  try {
    // Check if the email column exists
    const columnExists = await db.selectFrom('information_schema.columns')
      .select('column_name')
      .where('table_name', '=', 'accounts')
      .where('column_name', '=', 'email')
      .executeTakeFirst();

    if (columnExists) {
      console.log('Removing email column from accounts table...');
      
      // Remove the email column
      await db.schema
        .alterTable('accounts')
        .dropColumn('email')
        .execute();
      
      console.log('Email column removed successfully');
    } else {
      console.log('Email column does not exist in accounts table');
    }
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error;
  }
}
