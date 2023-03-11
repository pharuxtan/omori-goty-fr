#pragma once

#include <windows.h>
#include <psapi.h>

class SigScan
{
public:
	// For getting information about the executing module
	MODULEINFO GetModuleInfo(char *szModule)
	{
		MODULEINFO modinfo = { 0 };
		HMODULE hModule = GetModuleHandle(szModule);
		if (hModule == 0)
			return modinfo;
		GetModuleInformation(GetCurrentProcess(), hModule, &modinfo, sizeof(MODULEINFO));
		return modinfo;
	}

	// for finding a signature/pattern in memory of another process
	uintptr_t FindPattern(char *module, char *pattern, char *mask)
	{
		MODULEINFO mInfo = GetModuleInfo(module);
		uintptr_t base = (uintptr_t)mInfo.lpBaseOfDll;
		DWORD size = (DWORD)mInfo.SizeOfImage;
		DWORD patternLength = (DWORD)strlen(mask);

		for (DWORD i = 0; i < size - patternLength; i++)
		{
			bool found = true;
			for (DWORD j = 0; j < patternLength; j++)
			{
				found &= mask[j] == '?' || pattern[j] == *(char*)(base + i + j);
			}
			if (found)
			{
				return base + i;
			}
		}

		return NULL;
	}
};