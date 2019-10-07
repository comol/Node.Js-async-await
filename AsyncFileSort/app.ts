import * as fs from 'fs';
import * as path from 'path';
import { checkServerIdentity } from 'tls';

let srcpath: string = '';
let dstpath: string = '';
let needdelete: boolean = false;
let destdirs: Array<string> = [];
let Args: Array<string> = process.argv.slice( 2 );
let fsPromises = fs.promises;

//Копирует файл в правильный каталог по заданным правилам
async function copyfile( src: string, needdelete: boolean ): Promise<void>
{
	let filestring: string = src;
	let firstletter: string = getshortfilename( filestring ).substr( 0, 1 );
	let srcfile: string = src;
	let dstfile: string = path.join( dstpath, firstletter, getshortfilename( src ) );

	if ( destdirs.indexOf( firstletter ) == -1 )
	{
		let dirpath: string = path.join( dstpath, firstletter );
		destdirs.push( firstletter );

		let exists: boolean = true;
		try 
		{
			await fsPromises.access( dirpath );
		}
		catch ( err )
		{
			exists = false;
		}

		if ( !exists )
		{
			await fsPromises.mkdir( dirpath );
			await syscopyfile( srcfile, dstfile, needdelete );
		}
	}
	else
	{
		await syscopyfile( srcfile, dstfile, needdelete );
	}
}

async function syscopyfile( srcfile: string, dstfile: string, move: boolean ): Promise<void>
{

	let exists: boolean = true;
	try 
	{
		await fsPromises.access( dstfile );
	}
	catch ( err )
	{
		exists = false;
	}

	if ( !exists )
	{
		await fsPromises.copyFile( srcfile, dstfile)
		{
			if ( move )
			{
				await fsPromises.unlink( srcfile );
			}
		} 
	}
}


// Копирует и удаляет файлы в нужную папку
// рекурсивная функция
async function ReadAllFiles( dir: string, needdelete: boolean ): Promise<void>
{
	let readfiles: Array<string> = await fsPromises.readdir( dir ).then();
	for ( let i in readfiles )
	{
		let name: string = path.join( dir, readfiles[i] );
		let filestats: fs.Stats = await fsPromises.stat( name ).then();
	
		if ( filestats.isDirectory() )
		{
			await ReadAllFiles( name, needdelete );					
			await fsPromises.rmdir( name );
		}
		else 
		{
			await copyfile( name, needdelete );
		}
	}
				
}

// получает короткое имя файлов по полному
function getshortfilename( filename: string ): string
{
	let filearray = filename.split( '\\' );
	let shortfilename: string = filearray[filearray.length - 1];
	return shortfilename;
}

// Основной раздел
if ( Args.length < 2 )
{
	console.log( 'Usage: app.ts <source path> <destination path> [-delete]' );
	process.exit( 0 );
}

if ( Args.length == 3 )
{
	if ( Args[2] == '-delete' )
	{
		needdelete = true;
	}
}

srcpath = Args[0];
dstpath = Args[1];

ReadAllFiles( srcpath, needdelete );