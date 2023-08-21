class ExternalHelper {
    private static townCache: {[name: string] : boolean} = {};
    private static questlineCache: {[name: string] : boolean} = {};
    private static temporaryBattleCache: {[name: string] : boolean} = {};
    private static routeCache: {[name: string] : boolean} = {};
    private static gymCache: {[name: string] : boolean} = {};

    public static isInLiveVersion(content: Town | QuestLine | TemporaryBattle | RegionRoute | Gym) {
        if (content instanceof Town) {
            if (content.region > GameConstants.MAX_AVAILABLE_REGION) {
                return false;
            }
            if (ExternalHelper.townCache[content.name] == undefined) {
                ExternalHelper.townCache[content.name] = ExternalHelper.containsDevRequirement(content.requirements);
            }
            return !ExternalHelper.townCache[content.name];
        }
        if (content instanceof QuestLine) {
            if (ExternalHelper.questlineCache[content.name] == undefined) {
                ExternalHelper.questlineCache[content.name] = ExternalHelper.containsDevRequirement(content.requirement);
            }
            return !ExternalHelper.questlineCache[content.name];
        }
        if (content instanceof TemporaryBattle) {
            if (ExternalHelper.temporaryBattleCache[content.name] == undefined) {
                ExternalHelper.temporaryBattleCache[content.name] = ExternalHelper.containsDevRequirement(content.requirements);
            }
            return !ExternalHelper.temporaryBattleCache[content.name];
        }
        if (content instanceof RegionRoute) {
            if (content.region > GameConstants.MAX_AVAILABLE_REGION) {
                return false;
            }
            if (ExternalHelper.routeCache[content.routeName] == undefined) {
                ExternalHelper.routeCache[content.routeName] = ExternalHelper.containsDevRequirement(content.requirements);
            }
            return !ExternalHelper.routeCache[content.routeName];
        }
        if (content instanceof Gym) {
            if (ExternalHelper.gymCache[content.town] == undefined) {
                ExternalHelper.gymCache[content.town] = ExternalHelper.containsDevRequirement(content.requirements);
            }
            return !ExternalHelper.gymCache[content.town];
        }
        return true;
    }

    private static containsDevRequirement(requirements?: Requirement | Requirement[]) {
        if (!requirements) {
            return false;
        }
        if (requirements instanceof Requirement) {
            requirements = [requirements];
        }
        return requirements.some(r => ExternalHelper.isDevRequirement(r));
    }

    private static isDevRequirement(requirement: Requirement) {
        let containsDevRequirement = false;
        if (requirement instanceof DevelopmentRequirement) {
            containsDevRequirement = true;
        } else if (requirement instanceof QuestLineCompletedRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(requirement.cachedQuest);
        } else if (requirement instanceof QuestLineStartedRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(requirement.cachedQuest);
        } else if (requirement instanceof QuestLineStepCompletedRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(requirement.cachedQuest);
        } else if (requirement instanceof TemporaryBattleRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(TemporaryBattleList[requirement.battleName]);
        } else if (requirement instanceof RouteKillRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(Routes.getRoute(requirement.region, requirement.route));
        } else if (requirement instanceof ClearGymRequirement) {
            containsDevRequirement = !ExternalHelper.isInLiveVersion(Object.values(GymList).find(g => GameConstants.getGymIndex(g.town) == requirement.gymIndex));
        } else if (requirement instanceof MaxRegionRequirement) {
            containsDevRequirement = requirement.requiredValue > GameConstants.MAX_AVAILABLE_REGION;
        } else if (requirement instanceof ObtainedPokemonRequirement) {
            containsDevRequirement = !ExternalHelper.pokemonIsInLiveVersion(requirement.pokemon);
        } else if (requirement instanceof PokemonLevelRequirement) {
            containsDevRequirement = !ExternalHelper.pokemonIsInLiveVersion(requirement.pokemon);
        } else if (requirement instanceof StarterRequirement) {
            containsDevRequirement = requirement.region > GameConstants.MAX_AVAILABLE_REGION;
        } else if (requirement instanceof MultiRequirement) {
            containsDevRequirement = ExternalHelper.containsDevRequirement(requirement.requirements);
        } else if (requirement instanceof OneFromManyRequirement) {
            containsDevRequirement = requirement.requirements.every(r => ExternalHelper.isDevRequirement(r));
        }
        return containsDevRequirement;
    }

    public static pokemonIsInLiveVersion(name: PokemonNameType) {
        if (PokemonHelper.calcNativeRegion(name) > GameConstants.MAX_AVAILABLE_REGION) {
            return false;
        }

        const locations = PokemonHelper.getPokemonLocations(name);
        if (!locations) {
            return false;
        }
        //TODO: run ExternalHelper.isInLiveVersion for each location

        return true;
    }
}
