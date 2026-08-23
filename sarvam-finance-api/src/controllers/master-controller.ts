import { Request, Response } from 'express';
import { prisma } from '../lib/db';

/** GET /api/masters/countries */
export async function getCountries(req: Request, res: Response) {
  try {
    const countries = await prisma.countryMaster.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(countries.map((c) => c.name));
  } catch (error) {
    console.error('Error fetching countries from database:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
}

/** GET /api/masters/states?countryName=India */
export async function getStates(req: Request, res: Response) {
  try {
    const { countryName } = req.query;
    if (!countryName || typeof countryName !== 'string') {
      return res.status(400).json({ error: 'countryName query param is required' });
    }

    const country = await prisma.countryMaster.findFirst({
      where: { name: { equals: countryName, mode: 'insensitive' } },
    });

    if (!country) {
      return res.json([]);
    }

    const states = await prisma.stateMaster.findMany({
      where: { countryId: country.id },
      orderBy: { name: 'asc' },
    });

    res.json(states.map((s) => s.name));
  } catch (error) {
    console.error('Error fetching states from database:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
}

/** GET /api/masters/cities?countryName=India&stateName=Tamil+Nadu */
export async function getCities(req: Request, res: Response) {
  try {
    const { countryName, stateName } = req.query;
    if (!stateName || typeof stateName !== 'string') {
      return res.status(400).json({ error: 'stateName query param is required' });
    }

    let countryId: string | undefined;
    if (countryName && typeof countryName === 'string') {
      const country = await prisma.countryMaster.findFirst({
        where: { name: { equals: countryName, mode: 'insensitive' } },
      });
      if (country) countryId = country.id;
    }

    const state = await prisma.stateMaster.findFirst({
      where: {
        name: { equals: stateName, mode: 'insensitive' },
        ...(countryId ? { countryId } : {}),
      },
    });

    if (!state) {
      return res.json([]);
    }

    const cities = await prisma.cityMaster.findMany({
      where: { stateId: state.id },
      orderBy: { name: 'asc' },
    });

    res.json(cities.map((c) => c.name));
  } catch (error) {
    console.error('Error fetching cities from database:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
}

/** GET /api/masters/districts?countryName=India&stateName=Tamil+Nadu */
export async function getDistricts(req: Request, res: Response) {
  try {
    const { countryName, stateName } = req.query;
    if (!stateName || typeof stateName !== 'string') {
      return res.status(400).json({ error: 'stateName query param is required' });
    }

    let countryId: string | undefined;
    if (countryName && typeof countryName === 'string') {
      const country = await prisma.countryMaster.findFirst({
        where: { name: { equals: countryName, mode: 'insensitive' } },
      });
      if (country) countryId = country.id;
    }

    const state = await prisma.stateMaster.findFirst({
      where: {
        name: { equals: stateName, mode: 'insensitive' },
        ...(countryId ? { countryId } : {}),
      },
    });

    if (!state) {
      return res.json([]);
    }

    const districts = await prisma.districtMaster.findMany({
      where: { stateId: state.id },
      orderBy: { name: 'asc' },
    });

    if (districts.length > 0) {
      return res.json(districts.map((d) => d.name));
    }

    // Fallback to CityMaster if DistrictMaster table is empty for that state
    const cities = await prisma.cityMaster.findMany({
      where: { stateId: state.id },
      orderBy: { name: 'asc' },
    });

    res.json(cities.map((c) => c.name));
  } catch (error) {
    console.error('Error fetching districts from database:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
}
